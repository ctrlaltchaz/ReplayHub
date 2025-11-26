import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import {
  AbsenceReportDto,
  AttendanceExportDto,
  AttendanceFilterQuery,
  AttendanceLoggerResponse,
  ClockInDto,
  ClockOutDto,
  TutorReviewDto,
} from '../dto/attendance-logger.dto';
import { AttendanceExportService } from '../services/attendance-export.service';
import { AttendanceLoggerService } from '../services/attendance-logger.service';

@ApiTags('Attendance Logger')
@ApiBearerAuth()
@Controller('org/:slug/attendance/logger')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class AttendanceLoggerController {
  constructor(
    private readonly attendanceService: AttendanceLoggerService,
    private readonly exportService: AttendanceExportService
  ) {}

  @Post('clock-in')
  @ApiOperation({ summary: 'Clock in to a production session' })
  async clockIn(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() dto: ClockInDto
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.clockIn(actualTenantId, orgUserId, dto);
  }

  @Post('clock-out')
  @ApiOperation({ summary: 'Clock out of a session' })
  async clockOut(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() dto: ClockOutDto
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.clockOut(actualTenantId, orgUserId, dto);
  }

  @Post('absence')
  @ApiOperation({ summary: 'Log an absence for a session' })
  async logAbsence(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() dto: AbsenceReportDto
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.logAbsence(actualTenantId, orgUserId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get attendance entries for the current user' })
  async listMine(
    @TenantId() tenantId: string,
    @Req() req: any
  ): Promise<AttendanceLoggerResponse[]> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.listForStudent(actualTenantId, orgUserId);
  }

  @Get('wednesday')
  @ApiOperation({ summary: 'List attendance entries for a session (tutor view)' })
  @Can('attendance.view')
  async listForWednesday(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Query() filters: AttendanceFilterQuery
  ): Promise<AttendanceLoggerResponse[]> {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.attendanceService.listForFilters(actualTenantId, filters);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Tutor review or override an attendance entry' })
  @Can('attendance.manage')
  async review(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: TutorReviewDto
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.reviewEntry(actualTenantId, orgUserId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Undo clock-in on an attendance entry' })
  @Can('attendance.manage')
  async undoClockIn(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('id') id: string
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.undoClockIn(actualTenantId, orgUserId, id);
  }

  @Patch(':id/unclock-out')
  @ApiOperation({ summary: 'Undo clock-out on an attendance entry' })
  @Can('attendance.manage')
  async undoClockOut(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('id') id: string
  ): Promise<AttendanceLoggerResponse> {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.attendanceService.undoClockOut(actualTenantId, orgUserId, id);
  }

  @Post('export')
  @ApiOperation({ summary: 'Queue an attendance export job' })
  @Can('attendance.export')
  async export(@TenantId() tenantId: string, @Req() req: any, @Body() dto: AttendanceExportDto) {
    const actualTenantId = req.tenant?.id || tenantId;
    const orgUserId = req.orgUser?.id;
    if (!orgUserId) throw new UnauthorizedException('Org user context missing');
    return this.exportService.queueExport(actualTenantId, orgUserId, dto);
  }
}
