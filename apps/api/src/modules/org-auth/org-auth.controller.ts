import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OrgAuthLoginDto, OrgAuthRegisterDto, TotpVerifyDto } from './dto';
import { OrgAuthGuard } from './guards/org-auth.guard';
import { OrgAuthService } from './org-auth.service';
import { AuditService } from '../../common/audit/audit.service';

@Controller('org/:slug/auth')
export class OrgAuthController {
  constructor(
    private orgAuthService: OrgAuthService,
    private readonly auditService: AuditService
  ) {}

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
  async register(@Body() registerDto: OrgAuthRegisterDto, @Req() req: Request) {
    const result = await this.orgAuthService.register(req.tenant!.id, registerDto, req.orgUser!.id);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: OrgAuthLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // Extract tenant slug from URL params
    const tenantSlug = req.params.slug;
    if (!tenantSlug) {
      throw new BadRequestException('Organization slug required');
    }

    try {
      const { orgUser } = await this.orgAuthService.login(tenantSlug, loginDto);

      // Set org session
      req.session.membershipId = orgUser.id;
      req.session.orgTenant = tenantSlug;

      // Force session save before responding
      await new Promise<void>((resolve, reject) => {
        req.session.save(err => {
          if (err) {
            console.error('[OrgAuth] Session save error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      await this.auditService.log({
        tenantId: req.tenant?.id,
        action: 'auth.login',
        entity: 'auth',
        entityType: 'ORG_USER',
        entityId: orgUser.id,
        description: 'Organisation user login',
        orgUserId: orgUser.id,
        metadata: {
          email: orgUser.email,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return { orgUser };
    } catch (error) {
      await this.auditService.log({
        tenantId: req.tenant?.id,
        action: 'auth.login',
        entity: 'auth',
        entityType: 'ORG_USER',
        description: 'Organisation user login failed',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Login failed',
        metadata: {
          email: loginDto.email,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    // Clear org session
    delete req.session.membershipId;
    delete req.session.orgTenant;

    await this.auditService.log({
      tenantId: req.tenant?.id,
      action: 'auth.logout',
      entity: 'auth',
      entityType: 'ORG_USER',
      orgUserId: (req as any).orgUser?.id ?? null,
      description: 'Organisation user logout',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Logged out successfully' };
  }

  @Post('2fa/setup')
  @UseGuards(OrgAuthGuard)
  async setupTotp(@Req() req: Request) {
    const totpSetup = await this.orgAuthService.setupTotp(
      req.tenant!.id,
      req.orgUser!.id,
      req.tenant!.name
    );
    return totpSetup;
  }

  @Post('2fa/verify')
  @UseGuards(OrgAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyTotp(@Body() verifyDto: TotpVerifyDto, @Req() req: Request) {
    try {
      const result = await this.orgAuthService.verifyAndEnableTotp(
        req.tenant!.id,
        req.orgUser!.id,
        verifyDto.token
      );

      await this.auditService.log({
        tenantId: req.tenant?.id,
        action: 'auth.2fa.verify',
        entity: 'auth',
        entityType: 'ORG_USER',
        entityId: req.orgUser!.id,
        orgUserId: req.orgUser!.id,
        description: 'Verified and enabled TOTP',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return result;
    } catch (error) {
      await this.auditService.log({
        tenantId: req.tenant?.id,
        action: 'auth.2fa.verify',
        entity: 'auth',
        entityType: 'ORG_USER',
        entityId: req.orgUser?.id,
        orgUserId: req.orgUser?.id,
        description: 'TOTP verification failed',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'TOTP verification failed',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      throw error;
    }
  }
}
