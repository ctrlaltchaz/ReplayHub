import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { RbacModule } from '../rbac/rbac.module';
import { InviteAcceptController, InviteController, PublicInviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
    imports: [DatabaseModule, TenantModule, GlobalAuthModule, OrgAuthModule, RbacModule, EmailModule, RateLimitModule],
    controllers: [InviteController, InviteAcceptController, PublicInviteController],
    providers: [InviteService],
    exports: [InviteService],
})
export class InviteModule { }