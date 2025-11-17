import { Module, forwardRef } from '@nestjs/common';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { OrgAuthGuard } from './guards/org-auth.guard';
import { OrgAuthController } from './org-auth.controller';
import { OrgAuthService } from './org-auth.service';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        UniversalAuthModule,
        DatabaseModule,
    ],
    controllers: [OrgAuthController],
    providers: [OrgAuthService, OrgAuthGuard, UnifiedTenantAuthGuard],
    exports: [OrgAuthService, OrgAuthGuard],
})
export class OrgAuthModule { }