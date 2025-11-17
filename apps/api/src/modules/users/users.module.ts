import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UnifiedUserService } from './unified-user.service';

@Module({
    imports: [DatabaseModule],
    providers: [UnifiedUserService],
    exports: [UnifiedUserService],
})
export class UsersModule { }
