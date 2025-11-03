import { Module } from '@nestjs/common';
import { GlobalOrganisationsController } from './global-organisations.controller';
import { GlobalOrganisationsService } from './global-organisations.service';

@Module({
    controllers: [GlobalOrganisationsController],
    providers: [GlobalOrganisationsService],
})
export class GlobalOrganisationsModule { }