import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { CrewGroupsService, type CrewGroupDto } from '../services/crew-groups.service';

@Controller('org/:slug/crew-groups')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class CrewGroupsController {
    constructor(private readonly crewGroupsService: CrewGroupsService) { }

    @Get()
    @Can('events.view')
    async findAll(@Req() req: any) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new NotFoundException('Tenant context not found');
        }
        return this.crewGroupsService.findAll(tenantId);
    }

    @Post()
    @Can('events.manage')
    async create(@Req() req: any, @Body() dto: CrewGroupDto) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new NotFoundException('Tenant context not found');
        }
        return this.crewGroupsService.create(tenantId, dto);
    }

    @Put(':id')
    @Can('events.manage')
    async update(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: CrewGroupDto,
    ) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new NotFoundException('Tenant context not found');
        }
        return this.crewGroupsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @Can('events.manage')
    async delete(@Req() req: any, @Param('id') id: string) {
        const tenantId = req.tenant?.id;
        if (!tenantId) {
            throw new NotFoundException('Tenant context not found');
        }
        return this.crewGroupsService.delete(tenantId, id);
    }
}
