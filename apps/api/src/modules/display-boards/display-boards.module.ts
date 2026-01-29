import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { DisplayBoardsPublicController } from './display-boards-public.controller';
import { DisplayBoardsController } from './display-boards.controller';
import { DisplayBoardsService } from './display-boards.service';

@Module({
    imports: [
        DatabaseModule,
        TenantModule,
        GlobalAuthModule,
        OrgAuthModule,
        RbacModule,
        AuditModule,
    ],
    controllers: [DisplayBoardsController, DisplayBoardsPublicController],
    providers: [DisplayBoardsService],
    exports: [DisplayBoardsService],
})
export class DisplayBoardsModule { }
