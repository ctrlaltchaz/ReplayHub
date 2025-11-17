import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordWebhookService } from './discord-webhook.service';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { UserDiscordController } from './user-discord.controller';

@Module({
    imports: [DatabaseModule, TenantModule, UniversalAuthModule, OrgAuthModule],
    controllers: [DiscordController, UserDiscordController],
    providers: [DiscordService, DiscordWebhookService, DiscordBotService],
    exports: [DiscordService, DiscordBotService],
})
export class DiscordModule { }
