import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { AcceptInviteDto, CreateInviteDto } from './dto';
import { RegisterFromInviteDto } from './dto/register-from-invite.dto';
import { InviteService } from './invite.service';

@Controller('org/:slug/invites')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class InviteController {
    constructor(private inviteService: InviteService) { }

    @Post()
    @Can('invites.create')
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 invites per minute per caller
    async createInvite(@Body() createInviteDto: CreateInviteDto, @Req() req: Request) {
        const result = await this.inviteService.createInvite(
            req.tenant!.id,
            createInviteDto,
            req.orgUser!.id,
        );

        // Return invite details + token (for both email and link methods)
        return {
            invite: result.invite,
            token: result.token,
            inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${result.token}`,
        };
    }

    @Get()
    @Can('invites.read')
    async getPendingInvites(@Req() req: Request) {
        const invites = await this.inviteService.getPendingInvites(req.tenant!.id);
        return { invites };
    }

    @Delete(':id')
    @Can('invites.delete')
    async revokeInvite(@Param('id') inviteId: string, @Req() req: Request) {
        const result = await this.inviteService.revokeInvite(req.tenant!.id, inviteId);
        return result;
    }
}

// Public invite info controller (no auth required)
@Controller('invite')
@UseGuards(ThrottlerGuard)
export class PublicInviteController {
    constructor(private inviteService: InviteService) { }

    @Get(':token/info')
    async getInviteInfo(@Param('token') token: string) {
        const inviteInfo = await this.inviteService.getInviteInfo(token);
        return inviteInfo;
    }

    @Post(':token/register')
    @Throttle({ default: { limit: 3, ttl: 600000 } }) // 3 registrations per 10 minutes
    async registerFromInvite(
        @Param('token') token: string,
        @Body() registerDto: RegisterFromInviteDto,
    ) {
        const result = await this.inviteService.registerFromInvite(token, registerDto);
        return {
            success: true,
            message: 'Registration successful',
            globalUser: result.globalUser,
            orgUser: result.orgUser,
            organization: result.organization,
        };
    }
}

// Public invite acceptance controller (no auth required)
@Controller('org/:slug/invites/accept')
export class InviteAcceptController {
    constructor(private inviteService: InviteService) { }

    @UseGuards(ThrottlerGuard)
    @Post()
    @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 accepts per 10 minutes
    async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto, @Req() req: Request) {
        // Get tenant ID from URL params since we don't have tenant guard
        const orgSlug = req.params.slug;
        const result = await this.inviteService.acceptInvite(orgSlug, acceptInviteDto);
        return result;
    }
}
