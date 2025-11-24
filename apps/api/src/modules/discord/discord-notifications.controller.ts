import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantId } from '../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantAccessGuard } from '../../common/tenant/guards/tenant-access.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import {
  CreateScheduledNotificationDto,
  CreateScheduledNotificationSchema,
  UpdateScheduledNotificationDto,
  UpdateScheduledNotificationSchema,
  UpdateScheduledNotificationStatusDto,
  UpdateScheduledNotificationStatusSchema,
} from './dto';
import { DiscordScheduledNotificationsService } from './discord-scheduled-notifications.service';

@Controller('org/:slug/discord/notifications')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, TenantAccessGuard, PermissionGuard)
export class DiscordNotificationsController {
  constructor(private readonly scheduledNotifications: DiscordScheduledNotificationsService) {}

  @Get()
  @Can('org.settings.view')
  async list(@TenantId() tenantId: string) {
    return this.scheduledNotifications.list(tenantId);
  }

  @Get(':id')
  @Can('org.settings.view')
  async getOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.scheduledNotifications.get(tenantId, id);
  }

  @Post()
  @Can('org.settings.manage')
  async create(
    @TenantId() tenantId: string,
    @Body() body: CreateScheduledNotificationDto,
    @Req() req: Request
  ) {
    const dto = CreateScheduledNotificationSchema.parse(body);
    const actorId = req.orgUser?.id ?? req.principal?.id;
    return this.scheduledNotifications.create(tenantId, dto, actorId);
  }

  @Put(':id')
  @Can('org.settings.manage')
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateScheduledNotificationDto,
    @Req() req: Request
  ) {
    const dto = UpdateScheduledNotificationSchema.parse(body);
    const actorId = req.orgUser?.id ?? req.principal?.id;
    return this.scheduledNotifications.update(tenantId, id, dto, actorId);
  }

  @Patch(':id/status')
  @Can('org.settings.manage')
  async updateStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateScheduledNotificationStatusDto
  ) {
    const dto = UpdateScheduledNotificationStatusSchema.parse(body);
    return this.scheduledNotifications.updateStatus(tenantId, id, dto);
  }

  @Post(':id/run-now')
  @Can('org.settings.manage')
  async runNow(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.scheduledNotifications.runNow(tenantId, id);
  }

  @Delete(':id')
  @Can('org.settings.manage')
  async remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.scheduledNotifications.delete(tenantId, id);
  }
}
