import { Module } from '@nestjs/common';
import { AuditModule as CommonAuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { AuditController } from './audit.controller';

@Module({
    imports: [CommonAuditModule, TenantModule, OrgAuthModule, UniversalAuthModule, RbacModule],
    controllers: [AuditController],
})
export class AuditLogsModule { }