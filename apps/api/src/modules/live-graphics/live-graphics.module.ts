import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { LiveGraphicsController } from './live-graphics.controller';
import { LiveGraphicsPublicController } from './live-graphics-public.controller';
import { LiveGraphicsService } from './live-graphics.service';

@Module({
  imports: [
    DatabaseModule,
    TenantModule, // TenantGuard
    GlobalAuthModule, // UnifiedTenantAuthGuard dependency
    OrgAuthModule, // Org auth guard dependency
    RbacModule, // Permission guard
    AuditModule,
  ],
  controllers: [LiveGraphicsController, LiveGraphicsPublicController],
  providers: [LiveGraphicsService],
})
export class LiveGraphicsModule {}
