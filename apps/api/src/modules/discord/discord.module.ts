import { Module } from '@nestjs/common';
import { TenantModule } from '../../common/tenant/tenant.module';
import { DatabaseModule } from '../../database/database.module';
import { OrgAuthModule } from '../org-auth/org-auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { UniversalAuthModule } from '../universal-auth/universal-auth.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordWebhookService } from './discord-webhook.service';
import { DiscordNotificationsController } from './discord-notifications.controller';
import { DiscordScheduledNotificationsService } from './discord-scheduled-notifications.service';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { UserDiscordController } from './user-discord.controller';

@Module({
  imports: [DatabaseModule, TenantModule, UniversalAuthModule, OrgAuthModule, RbacModule],
  controllers: [DiscordController, UserDiscordController, DiscordNotificationsController],
  providers: [
    DiscordService,
    DiscordWebhookService,
    DiscordBotService,
    DiscordScheduledNotificationsService,
  ],
  exports: [DiscordService, DiscordBotService, DiscordScheduledNotificationsService],
})
export class DiscordModule {}
