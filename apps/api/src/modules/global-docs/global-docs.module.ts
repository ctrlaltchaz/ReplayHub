import { Module, forwardRef } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { GlobalDocsController } from './controllers/global-docs.controller';
import { GlobalDocsService } from './services/global-docs.service';

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => GlobalAuthModule),
        UniversalAuthModule,
        AuditModule,
    ],
    controllers: [GlobalDocsController],
    providers: [GlobalDocsService],
    exports: [GlobalDocsService],
})
export class GlobalDocsModule { }
