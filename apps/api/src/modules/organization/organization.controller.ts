import { Body, Controller, Get, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { UpdateQuickLinksDto } from './dto/quick-links.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationService } from './organization.service';
import { THEME_PRESETS } from './types/branding.types';

@Controller('org/:slug/profile')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class OrganizationController {
    constructor(private organizationService: OrganizationService) { }

    @Get()
    @Can('org.settings.view')
    async getOrganizationProfile(@Req() req: Request) {
        const organization = await this.organizationService.getOrganization(req.tenant!.id);
        return { organization };
    }

    @Get('themes')
    @Can('org.settings.view')
    async getAvailableThemes() {
        return { themes: Object.values(THEME_PRESETS) };
    }

    @Put()
    @Can('org.settings.manage')
    async updateOrganizationProfile(
        @Body() updateDto: UpdateOrganizationDto,
        @Req() req: Request
    ) {
        const organization = await this.organizationService.updateOrganization(
            req.tenant!.id,
            updateDto
        );
        return { organization };
    }

    @Post('logo')
    @Can('org.settings.manage')
    @UseInterceptors(FileInterceptor('file'))
    async uploadLogo(
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File
    ) {
        const logoUrl = await this.organizationService.uploadLogo(
            req.tenant!.id,
            file
        );
        return { logoUrl };
    }

    @Get('quick-links')
    async getQuickLinks(@Req() req: Request) {
        const quickLinks = await this.organizationService.getQuickLinks(req.tenant!.id);
        return { quickLinks };
    }

    @Put('quick-links')
    @Can('org.settings.manage')
    async updateQuickLinks(
        @Req() req: Request,
        @Body() dto: UpdateQuickLinksDto
    ) {
        const quickLinks = await this.organizationService.updateQuickLinks(
            req.tenant!.id,
            dto.quickLinks
        );
        return { quickLinks };
    }
}
