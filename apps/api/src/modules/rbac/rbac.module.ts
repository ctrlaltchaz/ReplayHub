import { Module, forwardRef } from '@nestjs/common';
import { TenantAccessGuard } from '../../common/tenant/guards/tenant-access.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { PermissionGuard } from './guards/permission.guard';
import { RbacController } from './rbac.controller';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        DatabaseModule,
        OrgAuthModule,
    ],
    controllers: [RbacController],
    providers: [PermissionService, RoleService, PermissionGuard, TenantAccessGuard, UnifiedTenantAuthGuard],
    exports: [PermissionService, RoleService, PermissionGuard, TenantAccessGuard],
})
export class RbacModule { }