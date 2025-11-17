import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { DiscordBotService } from '../discord/discord-bot.service';

@Injectable()
export class EventRemindersService {
    private readonly logger = new Logger(EventRemindersService.name);

    constructor(
        private prisma: PrismaService,
        private discordBot: DiscordBotService,
    ) { }

    /**
     * Check for events that need reminders
     * Runs every 10 minutes
     */
    @Cron(CronExpression.EVERY_10_MINUTES)
    async checkEventReminders() {
        this.logger.log('Checking for events that need reminders...');

        try {
            const now = new Date();
            const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const twentyFourHoursAndTenMinutes = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);

            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const twoHoursAndTenMinutes = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 10 * 60 * 1000);

            // Find events starting in 24 hours (within the next 10-minute window)
            const events24h = await this.prisma.event.findMany({
                where: {
                    startAt: {
                        gte: twentyFourHoursFromNow,
                        lte: twentyFourHoursAndTenMinutes,
                    },
                    status: 'scheduled',
                    teamId: { not: null },
                },
            });

            // Find events starting in 2 hours (within the next 10-minute window)
            const events2h = await this.prisma.event.findMany({
                where: {
                    startAt: {
                        gte: twoHoursFromNow,
                        lte: twoHoursAndTenMinutes,
                    },
                    status: 'scheduled',
                    teamId: { not: null },
                },
            });

            this.logger.log(`Found ${events24h.length} events in 24 hours, ${events2h.length} events in 2 hours`);

            // Send 24-hour reminders
            for (const event of events24h) {
                await this.sendEventReminder(event, '24 hours');
            }

            // Send 2-hour reminders
            for (const event of events2h) {
                await this.sendEventReminder(event, '2 hours');
            }
        } catch (error) {
            this.logger.error('Failed to check event reminders:', error);
        }
    }

    /**
     * Send reminder to all team members
     */
    private async sendEventReminder(event: any, timeframe: string) {
        try {
            this.logger.log(`Sending ${timeframe} reminder for event: ${event.title} (${event.id})`);

            if (!event.teamId) {
                this.logger.warn(`Event ${event.id} has no team assigned`);
                return;
            }

            // Get team members
            const team = await this.prisma.team.findUnique({
                where: { id: event.teamId },
                include: {
                    members: {
                        include: {
                            player: {
                                include: {
                                    orgUser: {
                                        include: {
                                            globalUser: {
                                                include: {
                                                    discordLinks: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!team) {
                this.logger.warn(`Team ${event.teamId} not found`);
                return;
            }

            this.logger.log(`Team ${team.name} has ${team.members.length} members`);

            // Send DM to each team member who has Discord linked and DMs enabled
            let sentCount = 0;
            let failedCount = 0;

            for (const member of team.members) {
                const discordLink = member.player?.orgUser?.globalUser?.discordLinks?.[0];

                if (!discordLink) {
                    this.logger.debug(`Player ${member.player?.gamerTag} has no Discord link`);
                    continue;
                }

                if (!discordLink.enableDMs) {
                    this.logger.debug(`Player ${member.player?.gamerTag} has DMs disabled`);
                    continue;
                }

                const discordUserId = discordLink.discordId;

                // Format event time
                const eventDate = new Date(event.startAt);
                const dateStr = eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const timeStr = eventDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });

                // Prepare DM fields
                const fields: { name: string; value: string; inline?: boolean }[] = [
                    { name: '📅 Date', value: dateStr, inline: false },
                    { name: '🕐 Time', value: timeStr, inline: true },
                    { name: '⏰ Starting In', value: timeframe, inline: true },
                ];

                if (event.eventType) {
                    fields.push({ name: '🎮 Type', value: event.eventType, inline: true });
                }

                if (event.gameTitle) {
                    fields.push({ name: '🎯 Game', value: event.gameTitle, inline: true });
                }

                if (event.location) {
                    fields.push({ name: '📍 Location', value: event.location, inline: false });
                }

                if (event.opponent) {
                    fields.push({ name: '⚔️ Opponent', value: event.opponent, inline: true });
                }

                if (event.tournamentName) {
                    fields.push({ name: '🏆 Tournament', value: event.tournamentName, inline: false });
                }

                if (event.callTime) {
                    const callTime = new Date(event.callTime);
                    const callTimeStr = callTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                    fields.push({ name: '📢 Call Time', value: callTimeStr, inline: true });
                }

                if (event.notes) {
                    fields.push({ name: '📝 Notes', value: event.notes, inline: false });
                }

                // Determine color based on timeframe
                const color = timeframe === '24 hours' ? 0x3498db : 0xe74c3c; // Blue for 24h, Red for 2h

                // Determine emoji based on event type
                const eventEmoji = event.eventType === 'Tournament' ? '🏆' :
                    event.eventType === 'Broadcast' ? '📺' :
                        event.eventType === 'Showmatch' ? '⚔️' : '📅';

                // Send DM
                const success = await this.discordBot.sendDirectMessage(
                    event.tenantId,
                    discordUserId,
                    {
                        title: `${eventEmoji} Event Reminder: ${event.title}`,
                        description: `Your team **${team.name}** has an event starting in **${timeframe}**!`,
                        color,
                        fields,
                    },
                );

                if (success) {
                    sentCount++;
                    this.logger.log(`✅ Reminder sent to ${member.player?.gamerTag}`);
                } else {
                    failedCount++;
                    this.logger.warn(`❌ Failed to send reminder to ${member.player?.gamerTag}`);
                }
            }

            this.logger.log(`Event ${event.title}: Sent ${sentCount} reminders, ${failedCount} failed`);
        } catch (error) {
            this.logger.error(`Failed to send reminder for event ${event.id}:`, error);
        }
    }
}
