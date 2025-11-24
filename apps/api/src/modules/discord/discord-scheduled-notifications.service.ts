import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { DiscordBotService } from './discord-bot.service';
import {
  CreateScheduledNotificationDto,
  UpdateScheduledNotificationDto,
  UpdateScheduledNotificationStatusDto,
} from './dto';

type NotificationRecord = Prisma.DiscordScheduledNotificationGetPayload<{}>;

@Injectable()
export class DiscordScheduledNotificationsService {
  private readonly logger = new Logger(DiscordScheduledNotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private botService: DiscordBotService
  ) {}

  async list(tenantId: string) {
    return this.prisma.discordScheduledNotification.findMany({
      where: { tenantId },
      orderBy: [{ status: 'asc' }, { nextRunAt: 'asc' }],
    });
  }

  async get(tenantId: string, id: string) {
    return this.prisma.discordScheduledNotification.findFirst({
      where: { tenantId, id },
    });
  }

  async create(tenantId: string, dto: CreateScheduledNotificationDto, actorId?: string) {
    const firstRun = new Date(dto.firstRunAt);
    const color = this.normalizeColor(dto.color);

    return this.prisma.discordScheduledNotification.create({
      data: {
        tenantId,
        name: dto.name,
        channelId: dto.channelId,
        mentionRoleId: dto.mentionRoleId || null,
        mentionEveryone: dto.mentionEveryone ?? false,
        embedTitle: dto.title,
        embedDescription: dto.description || null,
        embedUrl: dto.url || null,
        embedColor: color,
        embedFields: dto.fields || null,
        timezone: dto.timezone,
        firstRunAt: firstRun,
        nextRunAt: firstRun,
        recurrenceType: dto.recurrenceType || 'none',
        recurrenceInterval: dto.recurrenceInterval || 1,
        endAfterRuns: dto.endAfterRuns || null,
        status: 'active',
        createdBy: actorId,
        updatedBy: actorId,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateScheduledNotificationDto,
    actorId?: string
  ) {
    const notification = await this.getOrThrow(tenantId, id);
    const nextRunAt = dto.firstRunAt ? new Date(dto.firstRunAt) : notification.nextRunAt;
    const color =
      dto.color !== undefined ? this.normalizeColor(dto.color) : notification.embedColor;

    return this.prisma.discordScheduledNotification.update({
      where: { id },
      data: {
        name: dto.name ?? notification.name,
        channelId: dto.channelId ?? notification.channelId,
        mentionRoleId:
          dto.mentionRoleId !== undefined ? dto.mentionRoleId || null : notification.mentionRoleId,
        mentionEveryone: dto.mentionEveryone ?? notification.mentionEveryone,
        embedTitle: dto.title ?? notification.embedTitle,
        embedDescription:
          dto.description !== undefined ? dto.description || null : notification.embedDescription,
        embedUrl: dto.url !== undefined ? dto.url || null : notification.embedUrl,
        embedColor: color,
        embedFields: dto.fields !== undefined ? dto.fields || null : notification.embedFields,
        timezone: dto.timezone ?? notification.timezone,
        firstRunAt: dto.firstRunAt ? new Date(dto.firstRunAt) : notification.firstRunAt,
        nextRunAt,
        recurrenceType: dto.recurrenceType ?? notification.recurrenceType,
        recurrenceInterval: dto.recurrenceInterval ?? notification.recurrenceInterval,
        endAfterRuns:
          dto.endAfterRuns !== undefined ? dto.endAfterRuns || null : notification.endAfterRuns,
        updatedBy: actorId ?? notification.updatedBy,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, dto: UpdateScheduledNotificationStatusDto) {
    const notification = await this.getOrThrow(tenantId, id);

    if (dto.status === 'active' && notification.status === 'completed') {
      throw new BadRequestException('Completed notifications cannot be resumed');
    }

    let nextRunAt = notification.nextRunAt;
    if (dto.status === 'active' && !nextRunAt) {
      if (notification.recurrenceType === 'none') {
        throw new BadRequestException('One-time notifications cannot be resumed after completion');
      }
      nextRunAt = this.computeNextRun(notification, new Date());
    }

    return this.prisma.discordScheduledNotification.update({
      where: { id },
      data: { status: dto.status, nextRunAt },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.getOrThrow(tenantId, id);
    await this.prisma.discordScheduledNotification.delete({ where: { id } });
    return { success: true };
  }

  async runNow(tenantId: string, id: string) {
    const notification = await this.getOrThrow(tenantId, id);
    const result = await this.executeNotification(notification);
    return { success: result.success };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processDueNotifications() {
    const now = new Date();
    const due = await this.prisma.discordScheduledNotification.findMany({
      where: {
        status: 'active',
        nextRunAt: { lte: now },
      },
      orderBy: { nextRunAt: 'asc' },
      take: 20,
    });

    if (!due.length) {
      return;
    }

    for (const notification of due) {
      // lightweight lock to avoid double-processing
      const locked = await this.prisma.discordScheduledNotification.updateMany({
        where: {
          id: notification.id,
          status: 'active',
          nextRunAt: notification.nextRunAt,
        },
        data: { status: 'running' },
      });

      if (!locked.count) {
        continue;
      }

      try {
        await this.executeNotification(notification);
      } catch (error: any) {
        this.logger.error(
          `Failed to run scheduled notification ${notification.id}: ${error.message}`
        );
      } finally {
        // reset running status will be handled inside executeNotification via updateNextRun
      }
    }
  }

  private async executeNotification(notification: NotificationRecord) {
    const runAt = new Date();
    let success = false;
    let errorMessage: string | null = null;

    try {
      success = await this.botService.postToChannel(notification.tenantId, notification.channelId, {
        title: notification.embedTitle,
        description: notification.embedDescription || undefined,
        color: notification.embedColor || undefined,
        fields: (notification.embedFields as any) || undefined,
        url: notification.embedUrl || undefined,
        footer: 'ReplayHub',
        content: this.buildContent(notification),
      });
    } catch (error: any) {
      errorMessage = error.message || 'Unknown error sending notification';
      this.logger.error(`Error sending scheduled notification ${notification.id}: ${errorMessage}`);
    }

    await this.prisma.discordScheduledNotificationRun.create({
      data: {
        tenantId: notification.tenantId,
        notificationId: notification.id,
        runAt,
        status: success ? 'sent' : 'failed',
        errorMessage,
      },
    });

    await this.prisma.discordNotificationLog.create({
      data: {
        tenantId: notification.tenantId,
        notificationType: 'scheduled_custom',
        deliveryMethod: 'channel',
        channelId: notification.channelId,
        status: success ? 'sent' : 'failed',
        errorMessage: errorMessage || undefined,
        payload: {
          notificationId: notification.id,
          embedTitle: notification.embedTitle,
          embedDescription: notification.embedDescription,
        },
      },
    });

    await this.updateNextRun(notification, runAt, success, errorMessage || undefined);

    return { success, errorMessage };
  }

  private async updateNextRun(
    notification: NotificationRecord,
    lastRun: Date,
    success: boolean,
    error?: string
  ) {
    const totalRuns = notification.totalRuns + 1;
    const nextRunAt = this.computeNextRun(notification, lastRun, totalRuns);
    let status = notification.status === 'paused' ? 'paused' : 'active';

    if (!nextRunAt || (notification.endAfterRuns && totalRuns >= notification.endAfterRuns)) {
      status = 'completed';
    }

    await this.prisma.discordScheduledNotification.update({
      where: { id: notification.id },
      data: {
        lastRunAt: lastRun,
        nextRunAt,
        totalRuns,
        status,
        updatedBy: notification.updatedBy,
      },
    });
  }

  private computeNextRun(
    notification: NotificationRecord,
    fromDate: Date,
    totalRuns?: number
  ): Date | null {
    const recurrenceType = notification.recurrenceType || 'none';
    const interval = notification.recurrenceInterval || 1;

    if (notification.endAfterRuns && totalRuns && totalRuns >= notification.endAfterRuns) {
      return null;
    }

    switch (recurrenceType) {
      case 'daily':
        return new Date(fromDate.getTime() + interval * 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(fromDate.getTime() + interval * 7 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private normalizeColor(input?: string | number | null): number | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input === 'number') {
      return input;
    }
    const value = input.startsWith('#') ? input.slice(1) : input;
    const parsed = parseInt(value, 16);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private buildContent(notification: NotificationRecord): string | undefined {
    if (notification.mentionEveryone) return '@everyone';
    if (notification.mentionRoleId) return `<@&${notification.mentionRoleId}>`;
    return undefined;
  }

  private async getOrThrow(tenantId: string, id: string) {
    const notification = await this.get(tenantId, id);
    if (!notification) {
      throw new NotFoundException('Scheduled notification not found');
    }
    return notification;
  }
}
