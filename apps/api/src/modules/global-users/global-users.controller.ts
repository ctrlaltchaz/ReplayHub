import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionGuard } from '../global-auth/guards/session.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GlobalUsersService } from './global-users.service';
import { PrismaService } from '../../database/prisma.service';

@Controller('global/users')
@UseGuards(SessionGuard)
export class GlobalUsersController {
    constructor(
        private globalUsersService: GlobalUsersService,
        private prisma: PrismaService,
    ) { }

    @Get('profile')
    async getProfile(@Req() req: Request) {
        const user = await this.globalUsersService.getUserProfile(req.session.userId!);
        return { user };
    }

    @Get('debug-org/:tenantId')
    async debugOrg(@Req() req: Request) {
        const { tenantId } = req.params as any;
        
        // Try to find the organization
        const org = await this.prisma.organisation.findUnique({
            where: { id: tenantId },
        });

        // Also try by slug
        const orgBySlug = await this.prisma.organisation.findFirst({
            where: { slug: tenantId },
        });

        // Get all organizations
        const allOrgs = await this.prisma.organisation.findMany({
            select: { id: true, name: true, slug: true },
        });

        return {
            searchedId: tenantId,
            foundById: org,
            foundBySlug: orgBySlug,
            allOrganizations: allOrgs,
        };
    }

    @Put('profile')
    async updateProfile(@Req() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
        const user = await this.globalUsersService.updateUserProfile(
            req.session.userId!,
            updateProfileDto
        );
        return { user };
    }
}