import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { AttendanceLoggerModule } from '../attendance-logger/attendance-logger.module';
import { AuditModule } from '../../common/audit/audit.module';
import { ProductionSessionsController } from './controllers/production-sessions.controller';
import { ProductionSessionsService } from './services/production-sessions.service';

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    GlobalAuthModule,
    OrgAuthModule,
    RbacModule,
    AttendanceLoggerModule,
    AuditModule,
  ],
  controllers: [ProductionSessionsController],
  providers: [ProductionSessionsService],
  exports: [ProductionSessionsService],
})
export class ProductionSessionsModule {}
