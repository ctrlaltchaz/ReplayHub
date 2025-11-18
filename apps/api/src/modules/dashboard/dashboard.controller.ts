import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { BadgeCounts, DashboardService } from './dashboard.service';

@Controller('org/:slug/dashboard')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('counts')
    async getCounts(@Req() req: Request): Promise<BadgeCounts> {
        const counts = await this.dashboardService.getBadgeCounts(req.tenant!.id, req.orgUser?.id);
        return counts;
    }
}
