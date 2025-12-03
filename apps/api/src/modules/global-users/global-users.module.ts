import { Module } from '@nestjs/common';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { GlobalUsersController } from './global-users.controller';
import { GlobalUsersService } from './global-users.service';

@Module({
    imports: [GlobalAuthModule, UniversalAuthModule],
    controllers: [GlobalUsersController],
    providers: [GlobalUsersService],
})
export class GlobalUsersModule { }
