import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';
import { UniversalAuthController } from './universal-auth.controller';
import { UniversalAuthService } from './universal-auth.service';

@Module({
    imports: [DatabaseModule, EmailModule],
    controllers: [UniversalAuthController],
    providers: [UniversalAuthService],
    exports: [UniversalAuthService],
})
export class UniversalAuthModule { }
