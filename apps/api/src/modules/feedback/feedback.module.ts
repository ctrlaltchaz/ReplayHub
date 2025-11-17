import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

@Module({
    imports: [DatabaseModule, GlobalAuthModule, UniversalAuthModule],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule { }
