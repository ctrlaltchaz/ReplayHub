import { Module, forwardRef } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { ChecklistController } from './controllers/checklist.controller';
import { ChecklistService } from './services/checklist.service';

@Module({
    imports: [
        DatabaseModule,
        OrgAuthModule,
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => RbacModule),
        forwardRef(() => TenantModule),
    ],
    controllers: [ChecklistController],
    providers: [ChecklistService],
    exports: [ChecklistService],
})
export class ChecklistsModule { }
