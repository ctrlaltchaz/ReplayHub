import { Module, forwardRef } from '@nestjs/common';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { TenantModule } from '../../common/tenant/tenant.module';
import { EmailModule } from '../email/email.module';
import { GlobalAuthController } from './global-auth.controller';
import { GlobalAuthService } from './global-auth.service';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        EmailModule,
    ],
    controllers: [GlobalAuthController],
    providers: [GlobalAuthService, UnifiedTenantAuthGuard],
    exports: [GlobalAuthService, UnifiedTenantAuthGuard],
})
export class GlobalAuthModule { }