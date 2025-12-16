import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';

import { ImprovementsController } from './controllers/improvements.controller';
import { ImprovementsService } from './services/improvements.service';

@Module({
    imports: [
        forwardRef(() => TenantModule),
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => OrgAuthModule),
        forwardRef(() => RbacModule),
        DatabaseModule,
        AuditModule,
    ],
    providers: [ImprovementsService],
    controllers: [ImprovementsController],
    exports: [ImprovementsService],
})
export class ImprovementsModule { }
