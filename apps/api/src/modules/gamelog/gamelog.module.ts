import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DiscordModule } from '../discord/discord.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { GameLogController } from './controllers/gamelog.controller';
import { CsvExportService } from './services/export/csv-export.service';
import { PdfExportService } from './services/export/pdf-export.service';
import { GameLogService } from './services/gamelog.service';
import { MapGameService } from './services/mapgame.service';
import { PlayerStatService } from './services/playerstat.service';

@Module({
    imports: [
        DatabaseModule,
        TenantModule, // For TenantGuard
        GlobalAuthModule, // For UnifiedTenantAuthGuard
        OrgAuthModule, // For authentication guards
        RbacModule, // For permission guards and decorators
        DiscordModule, // For Discord notifications
    ],
    controllers: [GameLogController],
    providers: [
        GameLogService,
        MapGameService,
        PlayerStatService,
        PdfExportService,
        CsvExportService,
    ],
    exports: [
        GameLogService,
        MapGameService,
        PlayerStatService,
        PdfExportService,
        CsvExportService,
    ],
})
export class GameLogModule { }