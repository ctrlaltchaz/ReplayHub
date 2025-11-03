import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

interface DiscordEmbed {
    title?: string;
    description?: string;
    color?: number;
    fields?: EmbedField[];
    footer?: {
        text: string;
    };
    timestamp?: string;
    url?: string;
}

interface WebhookPayload {
    content?: string;
    embeds: DiscordEmbed[];
}

@Injectable()
export class DiscordWebhookService {
    private readonly logger = new Logger(DiscordWebhookService.name);

    constructor(private configService: ConfigService) { }

    /**
     * Send a webhook message to Discord
     */
    async sendWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Discord webhook failed: ${response.status} - ${errorText}`);
                return false;
            }

            this.logger.log('Discord webhook sent successfully');
            return true;
        } catch (error) {
            this.logger.error('Error sending Discord webhook:', error);
            return false;
        }
    }

    /**
     * Send event notification
     */
    async sendEventNotification(
        webhookUrl: string,
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
    ): Promise<boolean> {
        const emoji = type === 'created' ? '🎮' : type === 'updated' ? '📝' : '❌';
        const action = type === 'created' ? 'Created' : type === 'updated' ? 'Updated' : 'Cancelled';
        const color = type === 'created' ? 0x5865f2 : type === 'updated' ? 0xffa500 : 0xff0000;

        const fields: EmbedField[] = [];

        // Tournament-specific fields
        if (event.opponent || event.tournamentName) {
            if (event.teamName && event.opponent) {
                fields.push({
                    name: '🆚 Match',
                    value: `${event.teamName} vs ${event.opponent}`,
                    inline: false,
                });
            } else if (event.opponent) {
                fields.push({
                    name: '🆚 Opponent',
                    value: event.opponent,
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
                    name: '📊 Stage',
                    value: event.tournamentStage,
                    inline: true,
                });
            }

            if (event.bestOf && event.bestOf > 1) {
                fields.push({
                    name: '🎯 Format',
                    value: `Best of ${event.bestOf}`,
                    inline: true,
                });
            }
        }

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

        const embed: DiscordEmbed = {
            title: `${emoji} Event ${action}!`,
            description: `**${event.name}**${event.description ? `\n\n${event.description}` : ''}`,
            color,
            fields,
            footer: {
                text: 'ReplayHub',
            },
            timestamp: new Date().toISOString(),
        };

        if (event.url) {
            embed.url = event.url;
            fields.push({
                name: '🔗 View Details',
                value: `[Open in ReplayHub](${event.url})`,
                inline: false,
            });
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] });
    }

    /**
     * Send match/game result notification
     */
    async sendMatchNotification(
        webhookUrl: string,
        match: {
            game: string;
            opponent?: string;
            score?: string;
            result?: 'win' | 'loss' | 'draw';
            mvp?: string;
            notes?: string;
            url?: string;
        },
    ): Promise<boolean> {
        const emoji = match.result === 'win' ? '🏆' : match.result === 'loss' ? '😔' : '🤝';
        const color = match.result === 'win' ? 0x00ff00 : match.result === 'loss' ? 0xff0000 : 0xffff00;

        const fields: EmbedField[] = [];

        fields.push({
            name: '🎮 Game',
            value: match.game,
            inline: true,
        });

        if (match.opponent) {
            fields.push({
                name: '🆚 Opponent',
                value: match.opponent,
                inline: true,
            });
        }

        if (match.score) {
            fields.push({
                name: '📊 Score',
                value: match.score,
                inline: true,
            });
        }

        if (match.mvp) {
            fields.push({
                name: '⭐ MVP',
                value: match.mvp,
                inline: false,
            });
        }

        if (match.notes) {
            fields.push({
                name: '📝 Notes',
                value: match.notes,
                inline: false,
            });
        }

        const embed: DiscordEmbed = {
            title: `${emoji} Match Result Posted!`,
            description: match.result
                ? `**Result: ${match.result.toUpperCase()}**`
                : '**Match Completed**',
            color,
            fields,
            footer: {
                text: 'ReplayHub',
            },
            timestamp: new Date().toISOString(),
        };

        if (match.url) {
            embed.url = match.url;
            fields.push({
                name: '🔗 View Details',
                value: `[Open in ReplayHub](${match.url})`,
                inline: false,
            });
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] });
    }

    /**
     * Send roster update notification
     */
    async sendRosterNotification(
        webhookUrl: string,
        update: {
            type: 'player_added' | 'player_removed' | 'lineup_changed' | 'achievement';
            playerName?: string;
            teamName?: string;
            role?: string;
            details?: string;
            url?: string;
        },
    ): Promise<boolean> {
        const emojiMap = {
            player_added: '✅',
            player_removed: '❌',
            lineup_changed: '🔄',
            achievement: '🏆',
        };

        const titleMap = {
            player_added: 'Player Added to Roster',
            player_removed: 'Player Removed from Roster',
            lineup_changed: 'Lineup Updated',
            achievement: 'New Achievement Unlocked',
        };

        const emoji = emojiMap[update.type];
        const title = titleMap[update.type];

        const fields: EmbedField[] = [];

        if (update.playerName) {
            fields.push({
                name: '👤 Player',
                value: update.playerName,
                inline: true,
            });
        }

        if (update.teamName) {
            fields.push({
                name: '👥 Team',
                value: update.teamName,
                inline: true,
            });
        }

        if (update.role) {
            fields.push({
                name: '📋 Role',
                value: update.role,
                inline: true,
            });
        }

        if (update.details) {
            fields.push({
                name: '📝 Details',
                value: update.details,
                inline: false,
            });
        }

        const embed: DiscordEmbed = {
            title: `${emoji} ${title}`,
            color: 0x5865f2,
            fields,
            footer: {
                text: 'ReplayHub',
            },
            timestamp: new Date().toISOString(),
        };

        if (update.url) {
            embed.url = update.url;
            fields.push({
                name: '🔗 View Roster',
                value: `[Open in ReplayHub](${update.url})`,
                inline: false,
            });
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] });
    }

    /**
     * Send incident notification
     */
    async sendIncidentNotification(
        webhookUrl: string,
        incident: {
            title: string;
            category: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            description?: string;
            assignedTo?: string;
            url?: string;
        },
    ): Promise<boolean> {
        const severityEmoji = {
            low: '🟢',
            medium: '🟡',
            high: '🟠',
            critical: '🔴',
        };

        const severityColor = {
            low: 0x00ff00,
            medium: 0xffff00,
            high: 0xffa500,
            critical: 0xff0000,
        };

        const fields: EmbedField[] = [];

        fields.push({
            name: '📋 Category',
            value: incident.category,
            inline: true,
        });

        fields.push({
            name: `${severityEmoji[incident.severity]} Severity`,
            value: incident.severity.toUpperCase(),
            inline: true,
        });

        if (incident.assignedTo) {
            fields.push({
                name: '👤 Assigned To',
                value: incident.assignedTo,
                inline: true,
            });
        }

        if (incident.description) {
            fields.push({
                name: '📝 Description',
                value: incident.description.substring(0, 1024), // Discord limit
                inline: false,
            });
        }

        const embed: DiscordEmbed = {
            title: `⚠️ Incident Reported: ${incident.title}`,
            color: severityColor[incident.severity],
            fields,
            footer: {
                text: 'ReplayHub',
            },
            timestamp: new Date().toISOString(),
        };

        if (incident.url) {
            embed.url = incident.url;
            fields.push({
                name: '🔗 View Incident',
                value: `[Open in ReplayHub](${incident.url})`,
                inline: false,
            });
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] });
    }

    /**
     * Send generic/custom notification
     */
    async sendCustomNotification(
        webhookUrl: string,
        notification: {
            title: string;
            description?: string;
            color?: string;
            fields?: EmbedField[];
            url?: string;
        },
    ): Promise<boolean> {
        const embed: DiscordEmbed = {
            title: notification.title,
            description: notification.description,
            color: notification.color ? parseInt(notification.color.replace('#', ''), 16) : 0x5865f2,
            fields: notification.fields,
            footer: {
                text: 'ReplayHub',
            },
            timestamp: new Date().toISOString(),
        };

        if (notification.url) {
            embed.url = notification.url;
        }

        return this.sendWebhook(webhookUrl, { embeds: [embed] });
    }
}
