import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { DocsUploadController } from './controllers/docs-upload.controller';
import { DocsController } from './controllers/docs.controller';
import { DocsUploadService } from './services/docs-upload.service';
import { DocsService } from './services/docs.service';

@Module({
    imports: [
        DatabaseModule,
        OrgAuthModule,
        UniversalAuthModule,
        forwardRef(() => GlobalAuthModule),
        forwardRef(() => RbacModule),
        forwardRef(() => TenantModule),
        AuditModule,
    ],
    controllers: [DocsController, DocsUploadController],
    providers: [DocsService, DocsUploadService],
    exports: [DocsService],
})
export class DocsModule { }
