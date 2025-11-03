import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { GlobalAdminController } from './global-admin.controller';
import { GlobalAdminService } from './global-admin.service';

@Module({
    imports: [DatabaseModule, FeedbackModule],
    controllers: [GlobalAdminController],
    providers: [GlobalAdminService],
    exports: [GlobalAdminService],
})
export class GlobalAdminModule { }