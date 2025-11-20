import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { DiscordModule } from '../discord/discord.module';
import { AttendanceLoggerController } from './controllers/attendance-logger.controller';
import { AttendanceLoggerService } from './services/attendance-logger.service';
import { AttendanceExportService } from './services/attendance-export.service';
import { AttendancePolicyService } from './services/attendance-policy.service';
import { AttendanceSchedulerService } from './services/attendance-scheduler.service';
import { AttendanceNotificationService } from './services/attendance-notification.service';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    GlobalAuthModule,
    OrgAuthModule,
    RbacModule,
    DiscordModule,
    AuditModule,
  ],
  controllers: [AttendanceLoggerController],
  providers: [
    AttendanceLoggerService,
    AttendancePolicyService,
    AttendanceSchedulerService,
    AttendanceExportService,
    AttendanceNotificationService,
  ],
  exports: [AttendanceLoggerService, AttendanceExportService],
})
export class AttendanceLoggerModule {}
