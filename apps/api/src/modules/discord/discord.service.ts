import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DiscordBotService } from './discord-bot.service';
import { DiscordWebhookService } from './discord-webhook.service';
import {
    LinkDiscordServerDto,
    UpdateDiscordChannelsDto,
    UpdateDiscordSettingsDto
} from './dto';

@Injectable()
export class DiscordService {
    private readonly logger = new Logger(DiscordService.name);

    constructor(
        private prisma: PrismaService,
        private webhookService: DiscordWebhookService,
        private botService: DiscordBotService,
    ) { }

    /**
     * Get Discord configuration for an organization
     */
    async getConfig(tenantId: string) {
        try {
            const config = await this.prisma.organizationDiscord.findUnique({
                where: { tenantId },
            });

            // Don't expose the bot token in responses
            if (config) {
                const { botToken, ...safeConfig } = config;
                return {
                    ...safeConfig,
                    hasBotToken: !!botToken,
                };
            }

            // Return default config structure if none exists
            return {
                tenantId,
                guildId: null,
                guildName: null,
                channelEvents: null,
                channelMatches: null,
                channelRoster: null,
                channelIncidents: null,
                channelGeneral: null,
                enableChannelNotifications: true,
                enableUserDMs: false,
                enableEventNotifications: true,
                enableMatchNotifications: true,
                enableRosterNotifications: true,
                enableIncidentNotifications: true,
                hasBotToken: false,
            };
        } catch (error) {
            this.logger.error(`Error fetching Discord config for tenant ${tenantId}:`, error);

            // Return default config on error
            return {
                tenantId,
                guildId: null,
                guildName: null,
                channelEvents: null,
                channelMatches: null,
                channelRoster: null,
                channelIncidents: null,
                channelGeneral: null,
                enableChannelNotifications: true,
                enableUserDMs: false,
                enableEventNotifications: true,
                enableMatchNotifications: true,
                enableRosterNotifications: true,
                enableIncidentNotifications: true,
                hasBotToken: false,
            };
        }
    }

    /**
     * Link Discord server to organization
     */
    async linkServer(tenantId: string, dto: LinkDiscordServerDto) {
        this.logger.log(`Linking Discord server for tenant ${tenantId}`);

        let encryptedToken: string | undefined;
        let guildName: string | undefined;

        // If bot token provided, verify and encrypt it
        if (dto.botToken) {
            this.logger.log('Verifying bot token...');
            const verification = await this.botService.verifyBotToken(dto.botToken);

            if (!verification.valid) {
                const errorMsg = verification.error || 'Invalid bot token. Please check the token is correct and the bot has proper intents enabled.';
                this.logger.error(`Bot verification failed: ${errorMsg}`);
                throw new Error(errorMsg);
            }

            // Encrypt the token
            encryptedToken = this.botService.encryptToken(dto.botToken);

            // Get guild name if guild ID provided
            if (dto.guildId && verification.guilds) {
                const guild = verification.guilds.find(g => g.id === dto.guildId);
                if (!guild) {
                    throw new Error(`Bot is not a member of guild ${dto.guildId}. Please invite the bot to your Discord server first.`);
                }
                guildName = guild?.name;
            }

            this.logger.log(`Bot verified: ${verification.botTag}, guilds: ${verification.guilds?.length || 0}`);
        }

        const config = await this.prisma.organizationDiscord.upsert({
            where: { tenantId },
            create: {
                tenantId,
                botToken: encryptedToken,
                guildId: dto.guildId,
                guildName: guildName,
            },
            update: {
                botToken: encryptedToken || undefined,
                guildId: dto.guildId || undefined,
                guildName: guildName || undefined,
            },
        });

        // Connect the bot if token provided
        if (encryptedToken) {
            await this.botService.connectBot(tenantId, encryptedToken);
        }

        const { botToken, ...safeConfig } = config;
        return {
            ...safeConfig,
            hasBotToken: !!botToken,
        };
    }

    /**
     * Update webhook URLs
     */
    async updateChannels(tenantId: string, dto: UpdateDiscordChannelsDto) {
        if (!tenantId) {
            this.logger.error('updateChannels called with undefined tenantId');
            throw new Error('Tenant ID is required');
        }

        this.logger.log(`Updating Discord channels for tenant ${tenantId}`);

        try {
            const config = await this.prisma.organizationDiscord.upsert({
                where: { tenantId },
                create: {
                    tenantId,
                    channelEvents: dto.channelEvents || null,
                    channelMatches: dto.channelMatches || null,
                    channelRoster: dto.channelRoster || null,
                    channelIncidents: dto.channelIncidents || null,
                    channelGeneral: dto.channelGeneral || null,
                },
                update: {
                    channelEvents: dto.channelEvents !== undefined ? dto.channelEvents : undefined,
                    channelMatches: dto.channelMatches !== undefined ? dto.channelMatches : undefined,
                    channelRoster: dto.channelRoster !== undefined ? dto.channelRoster : undefined,
                    channelIncidents: dto.channelIncidents !== undefined ? dto.channelIncidents : undefined,
                    channelGeneral: dto.channelGeneral !== undefined ? dto.channelGeneral : undefined,
                },
            });

            const { botToken, ...safeConfig } = config;
            return {
                ...safeConfig,
                hasBotToken: !!botToken,
            };
        } catch (error) {
            this.logger.error(`Error updating Discord channels for tenant ${tenantId}:`, error);
            throw error;
        }
    }

    /**
     * Update Discord notification settings
     */
    async updateSettings(tenantId: string, dto: UpdateDiscordSettingsDto) {
        this.logger.log(`Updating Discord settings for tenant ${tenantId}`);

        try {
            const config = await this.prisma.organizationDiscord.upsert({
                where: { tenantId },
                create: {
                    tenantId,
                    enableEventNotifications: dto.enableEventNotifications ?? true,
                    enableMatchNotifications: dto.enableMatchNotifications ?? true,
                    enableRosterNotifications: dto.enableRosterNotifications ?? true,
                    enableIncidentNotifications: dto.enableIncidentNotifications ?? false,
                    enableChannelNotifications: dto.enableChannelNotifications ?? true,
                    enableUserDMs: dto.enableUserDMs ?? false,
                },
                update: dto,
            });

            const { botToken, ...safeConfig } = config;
            return {
                ...safeConfig,
                hasBotToken: !!botToken,
            };
        } catch (error) {
            this.logger.error(`Error updating Discord settings for tenant ${tenantId}:`, error);
            throw error;
        }
    }

    /**
     * Unlink Discord server from organization
     */
    async unlinkServer(tenantId: string) {
        this.logger.log(`Unlinking Discord server for tenant ${tenantId}`);

        await this.prisma.organizationDiscord.delete({
            where: { tenantId },
        });

        return { success: true };
    }

    /**
     * Send a test notification
     */
    async sendTestNotification(tenantId: string) {
        this.logger.log(`Sending test notification for tenant ${tenantId}`);

        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config) {
            throw new Error('Discord not configured for this organization');
        }

        if (!config.guildId || !config.botToken) {
            throw new Error('Discord bot not configured. Please link your bot first.');
        }

        // Collect all configured channels
        const channelsToTest = [
            { type: 'Events', id: config.channelEvents },
            { type: 'Matches', id: config.channelMatches },
            { type: 'Roster', id: config.channelRoster },
            { type: 'Incidents', id: config.channelIncidents },
            { type: 'General', id: config.channelGeneral },
        ].filter(ch => ch.id); // Only test channels that are configured

        if (channelsToTest.length === 0) {
            throw new Error('No channels configured. Please assign at least one channel.');
        }

        // Send test notification to all configured channels
        const results = await Promise.all(
            channelsToTest.map(async (channel) => {
                const success = await this.botService.postToChannel(
                    tenantId,
                    channel.id,
                    {
                        title: `🎮 Test Notification from ReplayHub`,
                        description: `This is a test notification sent to your **${channel.type}** channel.`,
                        color: 0x5865F2,
                        fields: [
                            { name: '📋 Status', value: 'Connected ✅', inline: true },
                            { name: '� Channel Type', value: channel.type, inline: true },
                            { name: '🤖 Bot', value: config.guildName || 'Connected', inline: true },
                        ],
                        footer: config.guildName || 'ReplayHub',
                    },
                );

                // Log each notification attempt
                await this.logNotification(
                    tenantId,
                    'test',
                    'channel',
                    success ? 'sent' : 'failed',
                    success ? undefined : `Failed to post to ${channel.type} channel`,
                    { channelType: channel.type, channelId: channel.id },
                );

                return { channel: channel.type, success };
            })
        );

        // Check if any failed
        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
            throw new Error(`Failed to send to: ${failed.map(f => f.channel).join(', ')}`);
        }

        return {
            success: true,
            message: 'Test notification sent successfully to Discord channel',
        };
    }

    /**
     * Log a Discord notification attempt
     */
    async logNotification(
        tenantId: string,
        notificationType: string,
        deliveryMethod: string,
        status: string,
        errorMessage?: string,
        payload?: any,
    ) {
        return this.prisma.discordNotificationLog.create({
            data: {
                tenantId,
                notificationType,
                deliveryMethod,
                status,
                errorMessage,
                payload,
            },
        });
    }

    /**
     * Send event notification to Discord
     */
    async notifyEvent(
        tenantId: string,
        event: {
            name: string;
            date?: Date;
            location?: string;
            description?: string;
            url?: string;
            // Tournament fields
            opponent?: string;
            tournamentName?: string;
            tournamentStage?: string;
            bestOf?: number;
            teamName?: string;
        },
        type: 'created' | 'updated' | 'cancelled' = 'created',
        assignedOrgUserIds?: string[], // Users assigned to this event
    ) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.enableEventNotifications || !config.enableChannelNotifications) {
            this.logger.debug(`Event notifications disabled for tenant ${tenantId}`);
            return;
        }

        if (!config.channelEvents) {
            this.logger.debug(`No events channel configured for tenant ${tenantId}`);
            return;
        }

        try {
            // Determine emoji and color based on type
            let emoji = '🎮';
            let color = 0x5865f2; // Default blue
            let actionText = 'Event Created';

            if (type === 'updated') {
                emoji = '✏️';
                color = 0xfaa61a; // Yellow/orange
                actionText = 'Event Updated';
            } else if (type === 'cancelled') {
                emoji = '❌';
                color = 0xed4245; // Red
                actionText = 'Event Cancelled';
            }

            // Build description
            let description = event.description || '';

            // Add opponent info if available (tournament match)
            if (event.opponent) {
                description = `${event.teamName || 'Team'} vs **${event.opponent}**\n${description}`;
            }

            // Build fields
            const fields: { name: string; value: string; inline?: boolean }[] = [];

            if (event.date) {
                fields.push({
                    name: '📅 Date',
                    value: new Date(event.date).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                    }),
                    inline: false,
                });
            }

            if (event.location) {
                fields.push({
                    name: '📍 Location',
                    value: event.location,
                    inline: true,
                });
            }

            if (event.tournamentName) {
                fields.push({
                    name: '🏆 Tournament',
                    value: event.tournamentName,
                    inline: true,
                });
            }

            if (event.tournamentStage) {
                fields.push({
                    name: '🎯 Stage',
                    value: event.tournamentStage,
                    inline: true,
                });
            }

            if (event.bestOf) {
                fields.push({
                    name: '📊 Format',
                    value: `Best of ${event.bestOf}`,
                    inline: true,
                });
            }

            const success = await this.botService.postToChannel(
                tenantId,
                config.channelEvents,
                {
                    title: `${emoji} ${actionText}: ${event.name}`,
                    description,
                    color,
                    fields,
                    url: event.url,
                    footer: config.guildName || 'ReplayHub',
                },
            );

            await this.logNotification(
                tenantId,
                'event',
                'channel',
                success ? 'sent' : 'failed',
                success ? undefined : 'Failed to post to channel',
                { event, type },
            );

            // Send DMs to assigned users if they have Discord linked
            if (assignedOrgUserIds && assignedOrgUserIds.length > 0 && config.enableUserDMs) {
                const globalUserIds = await this.getGlobalUserIds(assignedOrgUserIds);

                if (globalUserIds.length > 0) {
                    // Create personalized DM message
                    const dmMessage = {
                        title: `📋 You've Been Assigned to an Event`,
                        description: `You've just been assigned to **${event.name}**! Here are the details:`,
                        color,
                        fields,
                        url: event.url,
                    };

                    await this.sendDMsToUsers(
                        tenantId,
                        'event',
                        globalUserIds,
                        {
                            title: `${emoji} ${actionText}: ${event.name}`,
                            description,
                            color,
                            fields,
                            url: event.url,
                        },
                        dmMessage,
                        true, // personalOnly = true (user is assigned)
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Failed to send event notification: ${error.message}`);
            await this.logNotification(
                tenantId,
                'event',
                'channel',
                'failed',
                error.message,
                { event, type },
            );
        }
    }

    /**
     * Send match result notification to Discord
     */
    async notifyMatch(
        tenantId: string,
        match: {
            game: string;
            opponent?: string;
            score?: string;
            result?: 'win' | 'loss' | 'draw';
            mvp?: string;
            notes?: string;
            url?: string;
        },
        participantOrgUserIds?: string[], // Players who participated in the match
    ) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.enableMatchNotifications || !config.enableChannelNotifications) {
            this.logger.debug(`Match notifications disabled for tenant ${tenantId}`);
            return;
        }

        if (!config.channelMatches) {
            this.logger.debug(`No matches channel configured for tenant ${tenantId}`);
            return;
        }

        try {
            // Determine color and emoji based on result
            let color = 0x5865f2; // Blue (default)
            let emoji = '⚔️';

            if (match.result === 'win') {
                color = 0x57f287; // Green
                emoji = '🏆';
            } else if (match.result === 'loss') {
                color = 0xed4245; // Red
                emoji = '💔';
            } else if (match.result === 'draw') {
                color = 0xfaa61a; // Yellow
                emoji = '🤝';
            }

            // Build description
            let description = '';
            if (match.opponent) {
                description = `**vs ${match.opponent}**`;
            }
            if (match.score) {
                description += `\n**Score:** ${match.score}`;
            }
            if (match.notes) {
                description += `\n\n${match.notes}`;
            }

            // Build fields
            const fields: { name: string; value: string; inline?: boolean }[] = [];

            fields.push({
                name: '🎮 Game',
                value: match.game,
                inline: true,
            });

            if (match.result) {
                const resultText = match.result.charAt(0).toUpperCase() + match.result.slice(1);
                fields.push({
                    name: '📊 Result',
                    value: resultText,
                    inline: true,
                });
            }

            if (match.mvp) {
                fields.push({
                    name: '⭐ MVP',
                    value: match.mvp,
                    inline: true,
                });
            }

            const success = await this.botService.postToChannel(
                tenantId,
                config.channelMatches,
                {
                    title: `${emoji} Match Result: ${match.game}`,
                    description,
                    color,
                    fields,
                    url: match.url,
                    footer: config.guildName || 'ReplayHub',
                },
            );

            await this.logNotification(
                tenantId,
                'match',
                'channel',
                success ? 'sent' : 'failed',
                success ? undefined : 'Failed to post to channel',
                { match },
            );

            // Send DMs to participants if they have Discord linked
            if (participantOrgUserIds && participantOrgUserIds.length > 0 && config.enableUserDMs) {
                const globalUserIds = await this.getGlobalUserIds(participantOrgUserIds);

                if (globalUserIds.length > 0) {
                    // Create personalized DM message
                    const resultText = match.result === 'win' ? 'Great game!' : match.result === 'loss' ? 'Tough match, but well played!' : 'Nice effort!';
                    const dmMessage = {
                        title: `🎮 Match Result Posted`,
                        description: `${resultText} The results from your recent match have been recorded.`,
                        color,
                        fields,
                        url: match.url,
                    };

                    await this.sendDMsToUsers(
                        tenantId,
                        'match',
                        globalUserIds,
                        {
                            title: `${emoji} Match Result: ${match.game}`,
                            description,
                            color,
                            fields,
                            url: match.url,
                        },
                        dmMessage,
                        true, // personalOnly = true (user participated)
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Failed to send match notification: ${error.message}`);
            await this.logNotification(
                tenantId,
                'match',
                'channel',
                'failed',
                error.message,
                { match },
            );
        }
    }

    /**
     * Send roster update notification to Discord
     */
    async notifyRoster(
        tenantId: string,
        update: {
            type: 'player_added' | 'player_removed' | 'lineup_changed' | 'achievement';
            playerName?: string;
            teamName?: string;
            role?: string;
            details?: string;
            url?: string;
        },
        affectedOrgUserIds?: string[], // Players affected by the roster change
    ) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.enableRosterNotifications || !config.enableChannelNotifications) {
            this.logger.debug(`Roster notifications disabled for tenant ${tenantId}`);
            return;
        }

        if (!config.channelRoster) {
            this.logger.debug(`No roster channel configured for tenant ${tenantId}`);
            return;
        }

        try {
            // Determine emoji and color based on type
            let emoji = '👥';
            let color = 0x5865f2; // Blue
            let title = 'Roster Update';

            if (update.type === 'player_added') {
                emoji = '➕';
                color = 0x57f287; // Green
                title = 'Player Added';
            } else if (update.type === 'player_removed') {
                emoji = '➖';
                color = 0xed4245; // Red
                title = 'Player Removed';
            } else if (update.type === 'lineup_changed') {
                emoji = '🔄';
                color = 0xfaa61a; // Yellow
                title = 'Lineup Changed';
            } else if (update.type === 'achievement') {
                emoji = '🏅';
                color = 0xfee75c; // Gold
                title = 'Achievement Unlocked';
            }

            // Build description
            let description = '';
            if (update.playerName && update.teamName) {
                description = `**${update.playerName}** • ${update.teamName}`;
            } else if (update.playerName) {
                description = `**${update.playerName}**`;
            } else if (update.teamName) {
                description = update.teamName;
            }

            if (update.details) {
                description += `\n\n${update.details}`;
            }

            // Build fields
            const fields: { name: string; value: string; inline?: boolean }[] = [];

            if (update.role) {
                fields.push({
                    name: '🎯 Role',
                    value: update.role,
                    inline: true,
                });
            }

            const success = await this.botService.postToChannel(
                tenantId,
                config.channelRoster,
                {
                    title: `${emoji} ${title}`,
                    description,
                    color,
                    fields,
                    url: update.url,
                    footer: config.guildName || 'ReplayHub',
                },
            );

            await this.logNotification(
                tenantId,
                'roster',
                'channel',
                success ? 'sent' : 'failed',
                success ? undefined : 'Failed to post to channel',
                { update },
            );

            // Send DMs to affected users if they have Discord linked
            if (affectedOrgUserIds && affectedOrgUserIds.length > 0 && config.enableUserDMs) {
                const globalUserIds = await this.getGlobalUserIds(affectedOrgUserIds);

                if (globalUserIds.length > 0) {
                    // Create personalized DM message
                    let dmDescription = '';
                    if (update.type === 'player_added') {
                        dmDescription = `Welcome to the team! You've been added to ${update.teamName || 'the roster'}.`;
                    } else if (update.type === 'player_removed') {
                        dmDescription = `You've been removed from ${update.teamName || 'the roster'}.`;
                    } else if (update.type === 'lineup_changed') {
                        dmDescription = `The lineup for ${update.teamName || 'your team'} has been updated.`;
                    } else if (update.type === 'achievement') {
                        dmDescription = `Congratulations! ${update.details || 'You have earned an achievement!'} 🎉`;
                    }

                    const dmMessage = {
                        title: `👥 Roster Update`,
                        description: dmDescription,
                        color,
                        fields,
                        url: update.url,
                    };

                    await this.sendDMsToUsers(
                        tenantId,
                        'roster',
                        globalUserIds,
                        {
                            title: `${emoji} ${title}`,
                            description,
                            color,
                            fields,
                            url: update.url,
                        },
                        dmMessage,
                        true, // personalOnly = true (user is affected)
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Failed to send roster notification: ${error.message}`);
            await this.logNotification(
                tenantId,
                'roster',
                'channel',
                'failed',
                error.message,
                { update },
            );
        }
    }

    /**
     * Send incident notification to Discord
     */
    async notifyIncident(
        tenantId: string,
        incident: {
            title: string;
            category: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            description?: string;
            assignedTo?: string;
            url?: string;
        },
        mentionedOrgUserIds?: string[], // Users mentioned or assigned to the incident
    ) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.enableIncidentNotifications || !config.enableChannelNotifications) {
            this.logger.debug(`Incident notifications disabled for tenant ${tenantId}`);
            return;
        }

        if (!config.channelIncidents) {
            this.logger.debug(`No incidents channel configured for tenant ${tenantId}`);
            return;
        }

        try {
            // Determine color and emoji based on severity
            let color = 0x5865f2; // Blue
            let emoji = 'ℹ️';

            if (incident.severity === 'low') {
                color = 0x57f287; // Green
                emoji = '🟢';
            } else if (incident.severity === 'medium') {
                color = 0xfaa61a; // Yellow
                emoji = '🟡';
            } else if (incident.severity === 'high') {
                color = 0xed4245; // Red
                emoji = '🔴';
            } else if (incident.severity === 'critical') {
                color = 0x992d22; // Dark red
                emoji = '🚨';
            }

            // Build fields
            const fields: { name: string; value: string; inline?: boolean }[] = [];

            fields.push({
                name: '📂 Category',
                value: incident.category,
                inline: true,
            });

            fields.push({
                name: '⚠️ Severity',
                value: incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1),
                inline: true,
            });

            if (incident.assignedTo) {
                fields.push({
                    name: '👤 Assigned To',
                    value: incident.assignedTo,
                    inline: true,
                });
            }

            const success = await this.botService.postToChannel(
                tenantId,
                config.channelIncidents,
                {
                    title: `${emoji} Incident: ${incident.title}`,
                    description: incident.description || undefined,
                    color,
                    fields,
                    url: incident.url,
                    footer: config.guildName || 'ReplayHub',
                },
            );

            await this.logNotification(
                tenantId,
                'incident',
                'channel',
                success ? 'sent' : 'failed',
                success ? undefined : 'Failed to post to channel',
                { incident },
            );

            // Send DMs to mentioned/assigned users if they have Discord linked
            if (mentionedOrgUserIds && mentionedOrgUserIds.length > 0 && config.enableUserDMs) {
                const globalUserIds = await this.getGlobalUserIds(mentionedOrgUserIds);

                if (globalUserIds.length > 0) {
                    // Create personalized DM message
                    const severityText = incident.severity === 'critical' ? 'urgent' : incident.severity === 'high' ? 'important' : 'new';
                    const dmMessage = {
                        title: `🚨 You've Been Mentioned in an Incident`,
                        description: `There's a ${severityText} incident that requires your attention: **${incident.title}**`,
                        color,
                        fields,
                        url: incident.url,
                    };

                    await this.sendDMsToUsers(
                        tenantId,
                        'incident',
                        globalUserIds,
                        {
                            title: `${emoji} Incident: ${incident.title}`,
                            description: incident.description || undefined,
                            color,
                            fields,
                            url: incident.url,
                        },
                        dmMessage,
                        true, // personalOnly = true (user is mentioned)
                    );
                }
            }
        } catch (error) {
            this.logger.error(`Failed to send incident notification: ${error.message}`);
            await this.logNotification(
                tenantId,
                'incident',
                'channel',
                'failed',
                error.message,
                { incident },
            );
        }
    }

    /**
     * Send DM to a user via Discord bot
     */
    async sendUserDM(
        tenantId: string,
        discordUserId: string,
        message: {
            title: string;
            description?: string;
            color?: number;
            fields?: { name: string; value: string; inline?: boolean }[];
            url?: string;
        },
    ) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.enableUserDMs || !config.botToken) {
            this.logger.debug(`User DMs disabled or bot not configured for tenant ${tenantId}`);
            return false;
        }

        try {
            const success = await this.botService.sendDirectMessage(tenantId, discordUserId, message);

            await this.logNotification(
                tenantId,
                'dm',
                'bot_dm',
                success ? 'sent' : 'failed',
                success ? undefined : 'Failed to send DM',
                { discordUserId, message },
            );

            return success;
        } catch (error) {
            this.logger.error(`Failed to send DM: ${error.message}`);
            await this.logNotification(
                tenantId,
                'dm',
                'bot_dm',
                'failed',
                error.message,
                { discordUserId, message },
            );
            return false;
        }
    }

    /**
     * Get Discord channels for the configured guild
     */
    async getChannels(tenantId: string) {
        this.logger.log(`Getting channels for tenant ${tenantId}`);

        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config) {
            this.logger.warn(`No Discord config found for tenant ${tenantId}`);
            return [];
        }

        if (!config.guildId) {
            this.logger.warn(`No guild ID configured for tenant ${tenantId}`);
            return [];
        }

        if (!config.botToken) {
            this.logger.warn(`No bot token configured for tenant ${tenantId}`);
            return [];
        }

        this.logger.log(`Config found - guildId: ${config.guildId}, calling bot service...`);
        return this.botService.getGuildChannels(tenantId, config.guildId);
    }

    /**
     * Get Discord roles for the configured guild
     */
    async getRoles(tenantId: string) {
        const config = await this.prisma.organizationDiscord.findUnique({
            where: { tenantId },
        });

        if (!config || !config.guildId || !config.botToken) {
            return [];
        }

        return this.botService.getGuildRoles(tenantId, config.guildId);
    }

    /**
     * Get Discord user info
     */
    async getDiscordUserInfo(tenantId: string, discordUserId: string) {
        return this.botService.getUserInfo(tenantId, discordUserId);
    }

    // =========================================================================
    // USER DISCORD LINKING (OAuth2)
    // =========================================================================

    /**
     * Get Discord OAuth2 authorization URL
     */
    getDiscordAuthUrl(redirectUri: string, state?: string): string {
        const clientId = process.env.DISCORD_CLIENT_ID;
        const scopes = ['identify', 'guilds']; // Add 'email' if needed

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: scopes.join(' '),
        });

        if (state) {
            params.append('state', state);
        }

        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    }

    /**
     * Exchange OAuth2 code for access token and link user
     */
    async linkUserDiscord(globalUserId: string, code: string, redirectUri: string) {
        try {
            const clientId = process.env.DISCORD_CLIENT_ID;
            const clientSecret = process.env.DISCORD_CLIENT_SECRET;

            // Exchange code for access token
            const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri,
                }),
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to exchange OAuth2 code for token');
            }

            const tokens = await tokenResponse.json();

            // Get user info from Discord
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            });

            if (!userResponse.ok) {
                throw new Error('Failed to fetch Discord user info');
            }

            const discordUser = await userResponse.json();

            // Encrypt tokens for storage
            const encryptedAccessToken = this.botService.encryptToken(tokens.access_token);
            const encryptedRefreshToken = tokens.refresh_token
                ? this.botService.encryptToken(tokens.refresh_token)
                : null;

            const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

            // Create or update user Discord link
            const link = await this.prisma.userDiscordLink.upsert({
                where: { globalUserId },
                create: {
                    globalUserId,
                    discordId: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator || null,
                    avatar: discordUser.avatar,
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    tokenExpiry,
                },
                update: {
                    discordId: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator || null,
                    avatar: discordUser.avatar,
                    accessToken: encryptedAccessToken,
                    refreshToken: encryptedRefreshToken,
                    tokenExpiry,
                },
            });

            this.logger.log(`Discord account linked for user ${globalUserId}: ${discordUser.username}`);

            // Send welcome DM to the user (try to send via any connected org bot)
            try {
                // Get user's org users to find an org with Discord bot
                const orgUsers = await this.prisma.orgUser.findMany({
                    where: { globalUserId },
                    select: { tenantId: true }
                });

                // Find first org with Discord bot configured
                let botTenantId: string | null = null;
                for (const orgUser of orgUsers) {
                    const discordConfig = await this.prisma.organizationDiscord.findUnique({
                        where: { tenantId: orgUser.tenantId },
                        select: { botToken: true }
                    });
                    if (discordConfig?.botToken) {
                        botTenantId = orgUser.tenantId;
                        break;
                    }
                }

                if (botTenantId) {
                    await this.botService.sendDirectMessage(
                        botTenantId,
                        discordUser.id,
                        {
                            title: '🎉 Discord Account Linked!',
                            description: 'Your Discord account has been successfully linked to your ReplayHub account.',
                            color: 0x5865F2,
                            fields: [
                                {
                                    name: '✅ What this means',
                                    value: 'You can now receive direct message notifications for:\n• Event updates and reminders\n• Match schedules\n• Team roster changes\n• Important announcements',
                                    inline: false
                                },
                                {
                                    name: '⚙️ Manage Notifications',
                                    value: 'You can customize your notification preferences in your profile settings at any time.',
                                    inline: false
                                }
                            ]
                        }
                    );
                    this.logger.log(`Welcome DM sent to Discord user ${discordUser.username}`);
                } else {
                    this.logger.log(`No Discord bot available to send welcome DM to ${discordUser.username}`);
                }
            } catch (dmError) {
                this.logger.warn(`Could not send welcome DM to ${discordUser.username}: ${dmError.message}`);
                // Don't fail the linking process if DM fails
            }

            return {
                success: true,
                discordUser: {
                    id: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator,
                    avatar: discordUser.avatar,
                },
            };
        } catch (error) {
            this.logger.error(`Failed to link Discord for user ${globalUserId}:`, error.message);
            throw new Error('Failed to link Discord account');
        }
    }

    /**
     * Get user's Discord link info
     */
    async getUserDiscordLink(globalUserId: string) {
        const link = await this.prisma.userDiscordLink.findUnique({
            where: { globalUserId },
        });

        if (!link) {
            return null;
        }

        // Don't return sensitive tokens
        const { accessToken, refreshToken, ...safeLink } = link;

        return {
            ...safeLink,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
        };
    }

    /**
     * Unlink user's Discord account
     */
    async unlinkUserDiscord(globalUserId: string) {
        await this.prisma.userDiscordLink.delete({
            where: { globalUserId },
        });

        this.logger.log(`Discord account unlinked for user ${globalUserId}`);

        return { success: true };
    }

    /**
     * Update user's DM preferences
     */
    async updateUserDMPreferences(globalUserId: string, preferences: {
        enableDMs?: boolean;
        dmEvents?: boolean;
        dmMatches?: boolean;
        dmRoster?: boolean;
        dmIncidents?: boolean;
        dmPersonalOnly?: boolean;
    }) {
        const updated = await this.prisma.userDiscordLink.update({
            where: { globalUserId },
            data: preferences,
        });

        this.logger.log(`DM preferences updated for user ${globalUserId}`);

        const { accessToken, refreshToken, ...safeLink } = updated;
        return safeLink;
    }

    // =========================================================================
    // DM NOTIFICATION HELPERS
    // =========================================================================

    /**
     * Send DM to users who have Discord linked and preferences enabled
     * @param tenantId - Organization tenant ID
     * @param notificationType - Type of notification (event|match|roster|incident)
     * @param userIds - Global user IDs to potentially notify
     * @param channelMessage - Message sent to channel (for reference)
     * @param dmMessage - Optional personalized message for DMs
     * @param personalOnly - Only send if user is directly mentioned/assigned
     */
    async sendDMsToUsers(
        tenantId: string,
        notificationType: 'event' | 'match' | 'roster' | 'incident',
        userIds: string[],
        channelMessage: {
            title: string;
            description?: string;
            color?: number;
            fields?: { name: string; value: string; inline?: boolean }[];
            url?: string;
        },
        dmMessage?: {
            title: string;
            description?: string;
            color?: number;
            fields?: { name: string; value: string; inline?: boolean }[];
            url?: string;
        },
        personalOnly: boolean = false,
    ) {
        if (!userIds || userIds.length === 0) {
            return;
        }

        // Get Discord links for these users with their names
        const discordLinks = await this.prisma.userDiscordLink.findMany({
            where: {
                globalUserId: { in: userIds },
                enableDMs: true, // Must have DMs enabled
            },
            include: {
                globalUser: {
                    select: {
                        name: true,
                    }
                }
            }
        });

        if (discordLinks.length === 0) {
            this.logger.debug(`No users with Discord DMs enabled for ${notificationType} notification`);
            return;
        }

        // Filter based on notification type preferences
        const eligibleLinks = discordLinks.filter(link => {
            // Check if personal-only mode is enabled and this is a broadcast
            if (link.dmPersonalOnly && !personalOnly) {
                return false;
            }

            // Check notification type preference
            switch (notificationType) {
                case 'event':
                    return link.dmEvents;
                case 'match':
                    return link.dmMatches;
                case 'roster':
                    return link.dmRoster;
                case 'incident':
                    return link.dmIncidents;
                default:
                    return false;
            }
        });

        if (eligibleLinks.length === 0) {
            this.logger.debug(`No users want ${notificationType} DMs (after filtering preferences)`);
            return;
        }

        // Send DMs to eligible users
        const results = await Promise.allSettled(
            eligibleLinks.map(async (link) => {
                try {
                    // Use personalized DM message if provided, otherwise use channel message
                    let messageToSend = dmMessage || channelMessage;

                    // Add personal greeting if we have a name
                    if (link.globalUser?.name) {
                        const firstName = link.globalUser.name.split(' ')[0];
                        messageToSend = {
                            ...messageToSend,
                            description: `Hi ${firstName}! 👋\n\n${messageToSend.description || ''}`,
                        };
                    }

                    const success = await this.botService.sendDirectMessage(
                        tenantId,
                        link.discordId,
                        messageToSend,
                    );

                    await this.logNotification(
                        tenantId,
                        notificationType,
                        'bot_dm',
                        success ? 'sent' : 'failed',
                        success ? undefined : 'Failed to send DM',
                        { discordUserId: link.discordId, globalUserId: link.globalUserId },
                    );

                    return { discordId: link.discordId, success };
                } catch (error) {
                    this.logger.error(`Failed to send DM to user ${link.globalUserId}:`, error.message);
                    return { discordId: link.discordId, success: false };
                }
            })
        );

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        this.logger.log(`Sent ${successCount}/${eligibleLinks.length} ${notificationType} DMs`);
    }

    /**
     * Get global user IDs from org user IDs
     */
    async getGlobalUserIds(orgUserIds: string[]): Promise<string[]> {
        if (!orgUserIds || orgUserIds.length === 0) {
            return [];
        }

        const orgUsers = await this.prisma.orgUser.findMany({
            where: { id: { in: orgUserIds } },
            select: { globalUserId: true },
        });

        return orgUsers
            .map(ou => ou.globalUserId)
            .filter((id): id is string => id !== null);
    }
}
