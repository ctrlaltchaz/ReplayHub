import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { RbacModule } from '../rbac/rbac.module';
import { InviteAcceptController, InviteController, PublicInviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { EmailService } from './services/email.service';

@Module({
    imports: [DatabaseModule, TenantModule, RbacModule],
    controllers: [InviteController, InviteAcceptController, PublicInviteController],
    providers: [InviteService, EmailService],
    exports: [InviteService],
})
export class InviteModule { }