import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { OrgAuthLoginDto, OrgAuthRegisterDto, TotpVerifyDto } from './dto';
import { OrgAuthGuard } from './guards/org-auth.guard';
import { OrgAuthService } from './org-auth.service';

@Controller('org/:slug/auth')
export class OrgAuthController {
    constructor(private orgAuthService: OrgAuthService) { }

    @Post('register')
    @UseGuards(OrgAuthGuard) // Only existing org users can register new users
    async register(
        @Body() registerDto: OrgAuthRegisterDto,
        @Req() req: Request,
    ) {
        const result = await this.orgAuthService.register(
            req.tenant!.id,
            registerDto,
            req.orgUser!.id,
        );
        return result;
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: OrgAuthLoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // Extract tenant slug from URL params
        const tenantSlug = req.params.slug;
        if (!tenantSlug) {
            throw new BadRequestException('Organization slug required');
        }

        const { orgUser } = await this.orgAuthService.login(tenantSlug, loginDto);

        console.log(`[OrgAuth] login(org): email=${loginDto.email} -> orgUserId=${orgUser.id}`);

        // Set org session
        req.session.orgUserId = orgUser.id;
        req.session.orgTenant = tenantSlug;

        // Force session save before responding
        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('[OrgAuth] Session save error:', err);
                    reject(err);
                } else {
                    console.log(`[OrgAuth] Session saved: orgUserId=${req.session.orgUserId}, sessionId=${req.session.id}`);
                    resolve();
                }
            });
        });

        console.log(`[OrgAuth] Response headers will include session cookie`);
        return { orgUser };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
        // Clear org session
        delete req.session.orgUserId;
        delete req.session.orgTenant;

        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard)
    async getProfile(@Req() req: Request) {
        const profile = await this.orgAuthService.getProfile(req.tenant!.id, req.orgUser!.id);
        return { orgUser: profile };
    }

    @Get('debug')
    async debugSession(@Req() req: Request) {
        console.log(`[Debug] Session inspection:`, {
            hasSession: !!req.session,
            sessionId: req.session?.id,
            orgUserId: req.session?.orgUserId,
            orgTenant: req.session?.orgTenant,
            allSessionKeys: req.session ? Object.keys(req.session) : [],
            sessionObject: req.session,
            cookieHeader: req.headers.cookie,
        });

        return {
            hasSession: !!req.session,
            orgUserId: req.session?.orgUserId,
            orgTenant: req.session?.orgTenant,
            tenant: req.tenant,
            cookies: req.headers.cookie,
            sessionId: req.session?.id,
            allSessionKeys: req.session ? Object.keys(req.session) : [],
            sessionData: req.session
        };
    }

    @Get('session-compare')
    async sessionCompare(@Req() req: Request) {
        // Test both session access patterns
        return {
            directSession: {
                orgUserId: req.session?.orgUserId,
                userId: req.session?.userId,
                sessionId: req.session?.id,
                keys: req.session ? Object.keys(req.session) : []
            },
            sessionObject: req.session,
            tenant: req.tenant,
            cookies: req.headers.cookie
        };
    }

    @Get('test-guard-logic')
    async testGuardLogic(@Req() req: Request) {
        try {
            // Test the exact logic that UnifiedTenantAuthGuard uses
            console.log(`[TestGuardLogic] Testing with orgUserId=${req.session?.orgUserId}, tenantId=${req.tenant?.id}`);

            if (!req.tenant) {
                return { error: 'No tenant context' };
            }

            if (!req.session?.orgUserId) {
                return { error: 'No orgUserId in session', session: req.session };
            }

            // Test the OrgAuthService call directly
            const result = await this.orgAuthService.validateOrgUser(req.tenant.id, req.session.orgUserId);

            return {
                success: true,
                orgUserProfile: result,
                sessionData: {
                    orgUserId: req.session.orgUserId,
                    tenantId: req.tenant.id
                }
            };
        } catch (error) {
            return {
                error: error.message,
                stack: error.stack,
                sessionData: {
                    orgUserId: req.session?.orgUserId,
                    tenantId: req.tenant?.id
                }
            };
        }
    }

    @Get('test-unified')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard)
    async testUnified(@Req() req: Request) {
        return {
            message: 'UnifiedTenantAuthGuard test successful',
            principal: req.principal,
            orgUser: req.orgUser,
            tenant: req.tenant
        };
    }

    @Get('test-unified-only')
    @UseGuards(TenantGuard, UnifiedTenantAuthGuard)
    async testUnifiedOnly(@Req() req: Request) {
        return {
            message: 'TenantGuard + UnifiedTenantAuthGuard test',
            principal: req.principal,
            orgUser: req.orgUser,
            tenant: req.tenant,
            session: {
                orgUserId: req.session?.orgUserId,
                userId: req.session?.userId
            }
        };
    }

    @Get('debug-unified')
    async debugUnified(@Req() req: Request) {
        try {
            // Manually instantiate and test UnifiedTenantAuthGuard
            const { PrismaService } = require('../../../database/prisma.service');
            const { UnifiedTenantAuthGuard } = require('../../../common/tenant/guards/unified-tenant-auth.guard');

            const prisma = new PrismaService();
            const guard = new UnifiedTenantAuthGuard(prisma);

            // Manually call the guard logic
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => req
                })
            };

            const result = await guard.canActivate(mockContext);

            return {
                success: true,
                result: result,
                principal: req.principal,
                orgUser: req.orgUser,
                session: {
                    orgUserId: req.session?.orgUserId,
                    userId: req.session?.userId
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                stack: error.stack,
                session: {
                    orgUserId: req.session?.orgUserId,
                    userId: req.session?.userId
                },
                tenant: req.tenant
            };
        }
    }

    @Get('test-service')
    async testService(@Req() req: Request) {
        try {
            const orgUserId = req.session?.orgUserId;
            const tenantId = req.tenant?.id;

            if (!orgUserId || !tenantId) {
                return { error: 'Missing session or tenant', orgUserId, tenantId };
            }

            const result = await this.orgAuthService.validateOrgUser(tenantId, orgUserId);
            return {
                message: 'OrgAuthService test successful',
                result,
                sessionData: {
                    orgUserId,
                    tenantId
                }
            };
        } catch (error) {
            return {
                error: 'OrgAuthService test failed',
                message: error.message,
                sessionData: {
                    orgUserId: req.session?.orgUserId,
                    tenantId: req.tenant?.id
                }
            };
        }
    }

    @Post('2fa/setup')
    @UseGuards(OrgAuthGuard)
    async setupTotp(@Req() req: Request) {
        const totpSetup = await this.orgAuthService.setupTotp(
            req.tenant!.id,
            req.orgUser!.id,
            req.tenant!.name,
        );
        return totpSetup;
    }

    @Post('2fa/verify')
    @UseGuards(OrgAuthGuard)
    @HttpCode(HttpStatus.OK)
    async verifyTotp(
        @Body() verifyDto: TotpVerifyDto,
        @Req() req: Request,
    ) {
        const result = await this.orgAuthService.verifyAndEnableTotp(
            req.tenant!.id,
            req.orgUser!.id,
            verifyDto.token,
        );
        return result;
    }
}