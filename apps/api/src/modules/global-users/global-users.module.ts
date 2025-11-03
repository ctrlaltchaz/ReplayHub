import { Module } from '@nestjs/common';
import { GlobalUsersController } from './global-users.controller';
import { GlobalUsersService } from './global-users.service';

@Module({
    controllers: [GlobalUsersController],
    providers: [GlobalUsersService],
})
export class GlobalUsersModule { }