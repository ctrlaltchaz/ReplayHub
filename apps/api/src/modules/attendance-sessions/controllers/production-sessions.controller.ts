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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import {
  CreateSessionDto,
  QuerySessionsDto,
  UpdateSessionDto,
} from '../dto/production-session.dto';
import { ProductionSessionsService } from '../services/production-sessions.service';
import { AttendanceLoggerService } from '../../attendance-logger/services/attendance-logger.service';
import { AttendanceFilterQuery } from '../../attendance-logger/dto/attendance-logger.dto';

@ApiTags('Attendance Sessions')
@ApiBearerAuth()
@Controller('org/:slug/attendance/sessions')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class ProductionSessionsController {
  constructor(
    private readonly sessionsService: ProductionSessionsService,
    private readonly attendanceService: AttendanceLoggerService
  ) {}

  @Get()
  @ApiOperation({ summary: 'List production sessions for an organisation' })
  @Can('attendance.view')
  async listSessions(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Query() query: QuerySessionsDto
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    await this.sessionsService.ensureDefaultSession(actualTenantId, req.orgUser?.id);
    return this.sessionsService.listSessions(actualTenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a production session' })
  @Can('attendance.manage')
  async createSession(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Body() dto: CreateSessionDto
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.sessionsService.createSession(actualTenantId, req.orgUser?.id, dto);
  }

  @Patch(':sessionId')
  @ApiOperation({ summary: 'Update a production session' })
  @Can('attendance.manage')
  async updateSession(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.sessionsService.updateSession(actualTenantId, sessionId, dto);
  }

  @Delete(':sessionId')
  @ApiOperation({ summary: 'Cancel a production session' })
  @Can('attendance.manage')
  async cancelSession(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('sessionId') sessionId: string
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    await this.sessionsService.cancelSession(actualTenantId, sessionId);
    return { success: true };
  }

  @Delete(':sessionId/hard')
  @ApiOperation({ summary: 'Delete a production session' })
  @Can('attendance.manage')
  async deleteSession(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('sessionId') sessionId: string
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    await this.sessionsService.removeSession(actualTenantId, sessionId);
    return { success: true };
  }

  @Get(':sessionId/entries')
  @ApiOperation({ summary: 'List attendance entries for a specific session' })
  @Can('attendance.view')
  async listSessionEntries(
    @TenantId() tenantId: string,
    @Req() req: any,
    @Param('sessionId') sessionId: string,
    @Query() query: AttendanceFilterQuery
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.attendanceService.listForFilters(actualTenantId, {
      ...query,
      sessionId,
    });
  }
}
