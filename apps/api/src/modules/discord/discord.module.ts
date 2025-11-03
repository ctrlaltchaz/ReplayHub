import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordWebhookService } from './discord-webhook.service';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { UserDiscordController } from './user-discord.controller';

@Module({
    imports: [DatabaseModule, TenantModule],
    controllers: [DiscordController, UserDiscordController],
    providers: [DiscordService, DiscordWebhookService, DiscordBotService],
    exports: [DiscordService],
})
export class DiscordModule { }
