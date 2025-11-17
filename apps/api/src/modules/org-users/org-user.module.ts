import { Module, forwardRef } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { OrgUserController } from './org-user.controller';
import { OrgUserService } from './org-user.service';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        DatabaseModule,
        RbacModule,
        OrgAuthModule,
    ],
    controllers: [OrgUserController],
    providers: [OrgUserService],
    exports: [OrgUserService],
})
export class OrgUserModule { }