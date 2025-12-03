import { Module } from '@nestjs/common';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { GlobalOrganisationsController } from './global-organisations.controller';
import { GlobalOrganisationsService } from './global-organisations.service';
import { OrganisationProvisioningService } from './organisation-provisioning.service';

@Module({
    imports: [GlobalAuthModule, UniversalAuthModule, RbacModule],
    controllers: [GlobalOrganisationsController],
    providers: [GlobalOrganisationsService, OrganisationProvisioningService],
    exports: [OrganisationProvisioningService],
})
export class GlobalOrganisationsModule { }
