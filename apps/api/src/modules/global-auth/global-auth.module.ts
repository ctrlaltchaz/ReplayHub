import { Module, forwardRef } from '@nestjs/common';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantModule } from '../../common/tenant/tenant.module';
import { EmailModule } from '../email/email.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { UsersModule } from '../users/users.module';
import { GlobalAuthController } from './global-auth.controller';
import { GlobalAuthService } from './global-auth.service';
import { SessionGuard } from './guards/session.guard';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        UniversalAuthModule,
        forwardRef(() => OrgAuthModule),
        EmailModule,
        UsersModule,
    ],
    controllers: [GlobalAuthController],
    providers: [GlobalAuthService, UnifiedTenantAuthGuard, SessionGuard],
    exports: [GlobalAuthService, UnifiedTenantAuthGuard, SessionGuard],
})
export class GlobalAuthModule { }
