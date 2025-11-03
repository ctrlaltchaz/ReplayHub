import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DiscordModule } from '../discord/discord.module';
import { GlobalAuthModule } from '../global-auth/global-auth.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import {
    AchievementController,
    ExportController,
    LineupController,
    PlayerController,
    RosterController,
    TeamController
} from './controllers';
import {
    AchievementService,
    ExportService,
    LineupService,
    PlayerService,
    TeamService
} from './services';

@Module({
    imports: [
        DatabaseModule,
        TenantModule, // For TenantGuard
        GlobalAuthModule, // For UnifiedTenantAuthGuard
        OrgAuthModule, // For authentication guards
        RbacModule, // For permission guards and decorators
        DiscordModule, // For roster notifications
    ],
    controllers: [
        RosterController,
        TeamController,
        PlayerController,
        LineupController,
        AchievementController,
        ExportController,
    ],
    providers: [
        TeamService,
        PlayerService,
        LineupService,
        AchievementService,
        ExportService,
    ],
    exports: [
        TeamService,
        PlayerService,
        LineupService,
        AchievementService,
        ExportService,
    ],
})
export class RosterModule { }