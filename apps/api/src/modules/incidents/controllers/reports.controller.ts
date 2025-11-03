import {
    Controller,
    Get,
    Header,
    Query,
    Res,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import {
    AttendanceReportResponse,
    IncidentReportResponse,
    QueryReportsDto
} from '../dto/incidents.dto';
import { ReportsService } from '../services/reports.service';

@ApiTags('Operations - Reports')
@ApiBearerAuth()
@Controller('org/:slug/reports')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('ping')
    @ApiOperation({ summary: 'Debug endpoint to test route registration' })
    ping() {
        console.log('[ReportsController] PING METHOD CALLED!');
        return { message: 'Reports controller is working', timestamp: new Date().toISOString() };
    }

    @Get('incidents')
    @ApiOperation({ summary: 'Get incidents analytics report' })
    @ApiResponse({
        status: 200,
        description: 'Incidents report generated successfully',
        type: IncidentReportResponse
    })
    @ApiResponse({ status: 400, description: 'Invalid date range or parameters' })
    @ApiResponse({ status: 404, description: 'Event not found (if eventId provided)' })
    async getIncidentReport(
        @TenantId() tenantId: string,
        @Query() queryDto: QueryReportsDto
    ): Promise<IncidentReportResponse> {
        try {
            console.log('[ReportsController] incidents report request:', {
                route: '/org/:slug/reports/incidents',
                tenantId,
                queryParams: {
                    from: queryDto.from,
                    to: queryDto.to,
                    category: queryDto.category,
                    severity: queryDto.severity,
                    eventId: queryDto.eventId
                }
            });
            return this.reportsService.getIncidentReport(tenantId, queryDto);
        } catch (error) {
            console.error('[ReportsController] incidents report error:', {
                route: '/org/:slug/reports/incidents',
                tenantId,
                queryParams: queryDto,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    @Get('attendance')
    @ApiOperation({ summary: 'Get attendance analytics report' })
    @ApiResponse({
        status: 200,
        description: 'Attendance report generated successfully',
        type: AttendanceReportResponse
    })
    @ApiResponse({ status: 400, description: 'Invalid date range or parameters' })
    @ApiResponse({ status: 404, description: 'Event not found (if eventId provided)' })
    async getAttendanceReport(
        @TenantId() tenantId: string,
        @Query() queryDto: QueryReportsDto
    ): Promise<AttendanceReportResponse> {
        return this.reportsService.getAttendanceReport(tenantId, queryDto);
    }

    @Get('incidents/export')
    @ApiOperation({ summary: 'Export incidents data as CSV' })
    @ApiResponse({
        status: 200,
        description: 'Incidents CSV file',
        headers: {
            'Content-Type': { description: 'text/csv' },
            'Content-Disposition': { description: 'attachment; filename="incidents.csv"' }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid parameters' })
    @Header('Content-Type', 'text/csv')
    async exportIncidentsCSV(
        @TenantId() tenantId: string,
        @Query() queryDto: QueryReportsDto,
        @Res() res: Response
    ): Promise<void> {
        const csvData = await this.reportsService.exportIncidentsToCSV(tenantId, queryDto);

        // Generate filename with current date
        const today = new Date().toISOString().split('T')[0];
        const filename = `incidents-${today}.csv`;

        res.set({
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'text/csv'
        });

        res.send(csvData);
    }

    @Get('attendance/export')
    @ApiOperation({ summary: 'Export attendance data as CSV' })
    @ApiResponse({
        status: 200,
        description: 'Attendance CSV file',
        headers: {
            'Content-Type': { description: 'text/csv' },
            'Content-Disposition': { description: 'attachment; filename="attendance.csv"' }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid parameters' })
    @Header('Content-Type', 'text/csv')
    async exportAttendanceCSV(
        @TenantId() tenantId: string,
        @Query() queryDto: QueryReportsDto,
        @Res() res: Response
    ): Promise<void> {
        const csvData = await this.reportsService.exportAttendanceToCSV(tenantId, queryDto);

        // Generate filename with current date
        const today = new Date().toISOString().split('T')[0];
        const filename = `attendance-${today}.csv`;

        res.set({
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'text/csv'
        });

        res.send(csvData);
    }
}