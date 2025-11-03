import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
    imports: [DatabaseModule, TenantModule, RbacModule],
    controllers: [OrganizationController],
    providers: [OrganizationService],
    exports: [OrganizationService],
})
export class OrganizationModule { }
