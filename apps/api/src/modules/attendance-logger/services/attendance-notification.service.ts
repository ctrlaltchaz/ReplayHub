import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';

export interface AutoClockOutNotificationEntry {
  id: string;
  orgUserId: string;
  orgUserDisplayName?: string | null;
  orgUserGlobalUserId?: string | null;
  eventTitle?: string | null;
}

@Injectable()
export class AttendanceNotificationService {
  private readonly logger = new Logger(AttendanceNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly discordService: DiscordService
  ) {}

  async notifyAutoClockOut(
    tenantId: string,
    entries: AutoClockOutNotificationEntry[],
    autoClockOutAt: Date
  ) {
    if (!entries.length) return;

    const globalUserIds = entries
      .map(e => e.orgUserGlobalUserId)
      .filter((id): id is string => !!id);

    if (!globalUserIds.length) return;

    const discordLinks = await this.prisma.userDiscordLink.findMany({
      where: { globalUserId: { in: globalUserIds } },
      select: { globalUserId: true, discordId: true },
    });

    const discordIdByGlobalUser = new Map(
      discordLinks.map(link => [link.globalUserId, link.discordId])
    );

    for (const entry of entries) {
      if (!entry.orgUserGlobalUserId) continue;
      const discordId = discordIdByGlobalUser.get(entry.orgUserGlobalUserId);
      if (!discordId) continue;

      const eventName = entry.eventTitle ?? 'production session';
      const message = {
        title: '⌛ Auto Clock-out Completed',
        description: `We clocked you out at ${autoClockOutAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} for **${eventName}**.`,
        color: 0xffc107,
        fields: [
          { name: 'Attendance', value: entry.id, inline: false },
          { name: 'Status', value: 'Auto clocked out at 6:00 PM', inline: false },
        ],
      };

      const success = await this.discordService.sendUserDM(tenantId, discordId, message);
      this.logger.log(
        `Auto clock-out DM ${success ? 'sent' : 'failed'} for orgUser ${entry.orgUserId}`
      );
    }
  }
}
