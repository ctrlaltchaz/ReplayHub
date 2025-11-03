import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import {
    AttendanceResponse,
    BulkCreateAttendanceDto,
    CreateAttendanceDto,
    QueryAttendanceDto,
    UpdateAttendanceDto
} from '../dto/incidents.dto';
import { AttendanceService } from '../services/attendance.service';

@ApiTags('Operations - Attendance')
@ApiBearerAuth()
@Controller('org/:slug/attendance')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new attendance record' })
    @ApiResponse({ status: 201, description: 'Attendance record created successfully', type: AttendanceResponse })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 404, description: 'Event or user not found' })
    @ApiResponse({ status: 409, description: 'Attendance record already exists' })
    async createAttendance(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Body() createDto: CreateAttendanceDto
    ): Promise<AttendanceResponse> {
        const actualTenantId = req.tenant?.id || tenantId;
        const createdBy = req.principal?.orgUserId || 'system';
        return this.attendanceService.createAttendance(actualTenantId, createdBy, createDto);
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Create multiple attendance records' })
    @ApiResponse({ status: 201, description: 'Attendance records created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async bulkCreateAttendance(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Body() bulkCreateDto: BulkCreateAttendanceDto
    ): Promise<{ created: AttendanceResponse[]; errors: string[] }> {
        const actualTenantId = req.tenant?.id || tenantId;
        const createdBy = req.principal?.orgUserId || 'system';
        return this.attendanceService.bulkCreateAttendance(actualTenantId, createdBy, bulkCreateDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get attendance records with optional filters' })
    @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
    async getAttendance(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Query() query: QueryAttendanceDto
    ): Promise<{ attendance: AttendanceResponse[]; total: number; page: number; totalPages: number }> {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.attendanceService.findAttendance(actualTenantId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get attendance record by ID' })
    @ApiResponse({ status: 200, description: 'Attendance record retrieved successfully', type: AttendanceResponse })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    async getAttendanceById(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Param('id') id: string
    ): Promise<AttendanceResponse> {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.attendanceService.findAttendanceById(actualTenantId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update attendance record' })
    @ApiResponse({ status: 200, description: 'Attendance record updated successfully', type: AttendanceResponse })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async updateAttendance(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateAttendanceDto
    ): Promise<AttendanceResponse> {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.attendanceService.updateAttendance(actualTenantId, id, updateDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete attendance record' })
    @ApiResponse({ status: 200, description: 'Attendance record deleted successfully' })
    @ApiResponse({ status: 404, description: 'Attendance record not found' })
    async deleteAttendance(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Param('id') id: string
    ): Promise<{ message: string }> {
        const actualTenantId = req.tenant?.id || tenantId;
        await this.attendanceService.deleteAttendance(actualTenantId, id);
        return { message: 'Attendance record deleted successfully' };
    }

    @Get('event/:eventId/stats')
    @ApiOperation({ summary: 'Get attendance statistics for an event' })
    @ApiResponse({ status: 200, description: 'Attendance statistics retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Event not found' })
    async getEventAttendanceStats(
        @TenantId() tenantId: string,
        @Req() req: any,
        @Param('eventId') eventId: string
    ): Promise<any> {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.attendanceService.getEventAttendanceStats(actualTenantId, eventId);
    }
}