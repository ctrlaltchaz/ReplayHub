import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { OrgAuthModule } from '../../modules/org-auth/org-auth.module';
import { UniversalAuthModule } from '../../modules/universal-auth/universal-auth.module';
import { TenantGuard } from './guards/tenant.guard';
import { UnifiedTenantAuthGuard } from './guards/unified-tenant-auth.guard';
import { TenantService } from './tenant.service';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => OrgAuthModule),
    UniversalAuthModule,
  ],
  providers: [
    TenantService,
    TenantGuard,
    UnifiedTenantAuthGuard,
  ],
  exports: [
    TenantService,
    TenantGuard,
    UnifiedTenantAuthGuard,
    UniversalAuthModule,
  ],
})
export class TenantModule { }
