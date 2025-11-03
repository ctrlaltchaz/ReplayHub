import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { CreateRunsheetTemplateDto, UpdateRunsheetTemplateDto } from '../dto';
import { RunsheetTemplateFullService } from '../services/runsheet-template-full.service';

@Controller('org/:slug/runsheet-templates-full')
@UseGuards(UnifiedTenantAuthGuard, TenantGuard)
export class RunsheetTemplateFullController {
    constructor(private readonly service: RunsheetTemplateFullService) { }

    @Post()
    @Can('runsheet.edit')
    async create(
        @Req() req: Request,
        @Body() dto: CreateRunsheetTemplateDto,
    ) {
        const tenantId = req.tenant?.id;
        const userId = req.orgUser?.id;

        console.log('CONTROLLER - tenantId:', tenantId);
        console.log('CONTROLLER - userId:', userId);
        console.log('CONTROLLER - dto:', dto);

        if (!userId) {
            throw new Error('User ID not found in request');
        }

        if (!tenantId) {
            throw new Error('Tenant ID not found in request');
        }

        return this.service.create(tenantId, dto, userId);
    }

    @Get()
    @Can('runsheet.view')
    async findAll(@Req() req: Request) {
        const tenantId = req.tenant!.id;
        const templates = await this.service.findAll(tenantId);
        return { data: templates };
    }

    @Get(':id')
    @Can('runsheet.view')
    async findOne(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        const tenantId = req.tenant!.id;
        return this.service.findOne(tenantId, id);
    }

    @Put(':id')
    @Can('runsheet.edit')
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateRunsheetTemplateDto,
    ) {
        const tenantId = req.tenant!.id;
        return this.service.update(tenantId, id, dto);
    }

    @Delete(':id')
    @Can('runsheet.edit')
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        const tenantId = req.tenant!.id;
        await this.service.delete(tenantId, id);
        return { success: true };
    }
}
