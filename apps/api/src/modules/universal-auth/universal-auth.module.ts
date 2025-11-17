import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { EmailModule } from '../email/email.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';
import { UsersModule } from '../users/users.module';
import { UnifiedSessionGuard } from './guards/unified-session.guard';
import { UniversalAuthController } from './universal-auth.controller';
import { UniversalAuthService } from './universal-auth.service';

@Module({
    imports: [DatabaseModule, EmailModule, UsersModule, RateLimitModule],
    controllers: [UniversalAuthController],
    providers: [UniversalAuthService, UnifiedSessionGuard],
    exports: [UniversalAuthService, UnifiedSessionGuard],
})
export class UniversalAuthModule { }
