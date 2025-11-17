import { Controller, Get, Param, Query, Req, Res, StreamableFile, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuditLogFilters, AuditService } from '../../common/audit/audit.service';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';
import { AuditLogResponseDto, AuditLogStatisticsResponse, toPaginatedResponse } from './dto/audit-log-response.dto';

@Controller('org/:slug/audit-logs')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
@Can('org.settings.manage')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async listAuditLogs(
        @Req() request: Request,
        @Query() filters: AuditLogFiltersDto,
    ): Promise<{ data: AuditLogResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
        const tenantId = this.getTenantId(request);
        const result = await this.auditService.getAuditLogs(tenantId, this.mapFilters(filters));
        return toPaginatedResponse(result);
    }

    @Get('stats')
    async getStatistics(
        @Req() request: Request,
        @Query() filters: AuditLogFiltersDto,
    ): Promise<AuditLogStatisticsResponse> {
        const tenantId = this.getTenantId(request);
        return this.auditService.getStatistics(tenantId, 7, this.mapFilters(filters));
    }

    @Get('user/:orgUserId')
    async getUserActivity(
        @Req() request: Request,
        @Param('orgUserId') orgUserId: string,
        @Query() filters: AuditLogFiltersDto,
    ): Promise<{ data: AuditLogResponseDto[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
        const tenantId = this.getTenantId(request);
        const result = await this.auditService.getUserActivity(tenantId, orgUserId, this.mapFilters(filters));
        return toPaginatedResponse(result);
    }

    @Get('export')
    @UseGuards(ThrottlerGuard)
    async exportAuditLogs(
        @Req() request: Request,
        @Res({ passthrough: true }) res: Response,
        @Query() filters: AuditLogFiltersDto,
    ): Promise<StreamableFile> {
        const tenantId = this.getTenantId(request);
        const mappedFilters = this.mapFilters(filters);
        const csv = await this.auditService.exportAuditLogs(tenantId, mappedFilters, mappedFilters.limit ?? 1000);
        const filename = `audit-logs-${tenantId}-${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return new StreamableFile(Buffer.from(csv, 'utf-8'));
    }

    @Get(':id')
    async getAuditLogById(
        @Req() request: Request,
        @Param('id') id: string,
    ): Promise<AuditLogResponseDto> {
        const tenantId = this.getTenantId(request);
        return this.auditService.getAuditLogById(tenantId, id);
    }

    private mapFilters(filters: AuditLogFiltersDto): AuditLogFilters {
        return {
            action: filters.action,
            entity: filters.entity,
            entityType: filters.entityType,
            entityId: filters.entityId,
            status: filters.status,
            userId: filters.userId,
            orgUserId: filters.orgUserId,
            search: filters.search,
            startDate: filters.startDate ? new Date(filters.startDate) : undefined,
            endDate: filters.endDate ? new Date(filters.endDate) : undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            limit: filters.limit,
            page: filters.page,
        };
    }

    private getTenantId(request: Request): string {
        const tenant = (request as Request & { tenant?: { id: string } }).tenant;
        if (!tenant?.id) {
            throw new Error('Tenant context missing for audit log operation');
        }
        return tenant.id;
    }
}
