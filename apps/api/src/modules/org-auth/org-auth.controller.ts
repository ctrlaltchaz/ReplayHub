import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { OrgAuthLoginDto, OrgAuthRegisterDto, TotpVerifyDto } from './dto';
import { OrgAuthGuard } from './guards/org-auth.guard';
import { OrgAuthService } from './org-auth.service';

@Controller('org/:slug/auth')
export class OrgAuthController {
    constructor(private orgAuthService: OrgAuthService) { }

    @Get('me')
    @UseGuards(OrgAuthGuard)
    async me(@Req() req: Request) {
        if (!req.orgUser || !req.tenant) {
            throw new UnauthorizedException('Organisation authentication required');
        }

        return { orgUser: req.orgUser };
    }

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

        // Set org session
        req.session.membershipId = orgUser.id;
        req.session.orgTenant = tenantSlug;

        // Force session save before responding
        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('[OrgAuth] Session save error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        return { orgUser };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: Request) {
        // Clear org session
        delete req.session.membershipId;
        delete req.session.orgTenant;

        return { message: 'Logged out successfully' };
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