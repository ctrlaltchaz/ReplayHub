import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { GlobalOrganisationsModule } from '../global-organisations/global-organisations.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { GlobalAdminController } from './global-admin.controller';
import { GlobalAdminService } from './global-admin.service';

@Module({
    imports: [DatabaseModule, FeedbackModule, GlobalAuthModule, UniversalAuthModule, GlobalOrganisationsModule],
    controllers: [GlobalAdminController],
    providers: [GlobalAdminService],
    exports: [GlobalAdminService],
})
export class GlobalAdminModule { }