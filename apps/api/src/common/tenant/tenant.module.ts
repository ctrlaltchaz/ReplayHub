import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TenantGuard } from './guards/tenant.guard';
import { UnifiedTenantAuthGuard } from './guards/unified-tenant-auth.guard';
import { TenantService } from './tenant.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    TenantService,
    TenantGuard,
    UnifiedTenantAuthGuard,
  ],
  exports: [
    TenantService,
    TenantGuard,
    UnifiedTenantAuthGuard,
  ],
})
export class TenantModule { }
