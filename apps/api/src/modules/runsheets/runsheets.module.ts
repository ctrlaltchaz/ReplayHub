import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { RunsheetTemplateFullController } from './controllers/runsheet-template-full.controller';
import { RunsheetController } from './controllers/runsheet.controller';
import { RunsheetTemplateFullService } from './services/runsheet-template-full.service';
import { RunsheetService } from './services/runsheet.service';

@Module({
  imports: [
    DatabaseModule,
    TenantModule, // For TenantGuard
    GlobalAuthModule, // For UnifiedTenantAuthGuard
    OrgAuthModule, // For authentication guards
    RbacModule, // For permission guards and decorators
    AuditModule,
  ],
  controllers: [RunsheetController, RunsheetTemplateFullController],
  providers: [RunsheetService, RunsheetTemplateFullService],
  exports: [RunsheetService, RunsheetTemplateFullService],
})
export class RunsheetsModule {}
