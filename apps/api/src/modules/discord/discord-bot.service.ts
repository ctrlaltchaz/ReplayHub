import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Client, EmbedBuilder, GatewayIntentBits, Guild } from 'discord.js';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DiscordBotService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DiscordBotService.name);
    private bots: Map<string, Client> = new Map(); // tenantId -> bot client
    private encryptionKey: string;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        // Get encryption key from env or generate one
        this.encryptionKey = this.configService.get<string>('DISCORD_ENCRYPTION_KEY') || this.generateEncryptionKey();
    }

    async onModuleInit() {
        this.logger.log('Discord Bot Service initialized');

        // Check if encryption key is configured
        if (!this.encryptionKey) {
            this.logger.warn('No DISCORD_ENCRYPTION_KEY configured. Bot features will use auto-generated key.');
        }

        // Load and connect all configured bots (non-blocking)
        try {
            await this.loadAllBots();
        } catch (error) {
            this.logger.error('Failed to load Discord bots on startup:', error.message);
            // Don't throw - allow the module to initialize even if bot loading fails
        }
    }

    async onModuleDestroy() {
        this.logger.log('Shutting down Discord bots...');
        // Disconnect all bots
        for (const [tenantId, bot] of this.bots.entries()) {
            bot.destroy();
            this.logger.log(`Bot disconnected for tenant ${tenantId}`);
        }
    }

    /**
     * Generate a random encryption key
     */
    private generateEncryptionKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Encrypt a bot token
     */
    encryptToken(token: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(this.encryptionKey, 'hex'),
            iv,
        );

        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return iv + encrypted data
        return iv.toString('hex') + ':' + encrypted;
    }

    /**
     * Decrypt a bot token
     */
    decryptToken(encryptedToken: string): string {
        const parts = encryptedToken.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(this.encryptionKey, 'hex'),
            iv,
        );

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Load all bots from database and connect them
     */
    private async loadAllBots() {
        try {
            // Load all organizations that have a Discord bot configured
            const configs = await this.prisma.organizationDiscord.findMany({
                where: {
                    botToken: { not: null },
                },
            });

            this.logger.log(`Found ${configs.length} Discord bot configurations to load`);

            for (const config of configs) {
                if (config.botToken) {
                    try {
                        this.logger.log(`Connecting bot for tenant ${config.tenantId}...`);
                        await this.connectBot(config.tenantId, config.botToken);
                        this.logger.log(`✅ Bot connected for tenant ${config.tenantId}`);
                    } catch (error) {
                        this.logger.error(`❌ Failed to connect bot for tenant ${config.tenantId}:`, error.message);
                        // Continue with other bots
                    }
                }
            }

            this.logger.log(`Successfully loaded ${this.bots.size} Discord bots`);
        } catch (error) {
            this.logger.error('Failed to load Discord bots from database:', error.message);
            throw error;
        }
    }

    /**
     * Connect a Discord bot for a tenant
     */
    async connectBot(tenantId: string, encryptedToken: string): Promise<boolean> {
        try {
            // Disconnect existing bot if any
            if (this.bots.has(tenantId)) {
                this.bots.get(tenantId)?.destroy();
                this.bots.delete(tenantId);
            }

            // Decrypt token
            const token = this.decryptToken(encryptedToken);

            // Create new bot client
            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.DirectMessages,
                ],
            });

            // Set up error handler
            client.on('error', (error) => {
                this.logger.error(`Discord bot error for tenant ${tenantId}:`, error);
            });

            // Wait for bot to be ready before resolving
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Bot connection timeout'));
                }, 15000); // 15 second timeout

                client.once('ready', () => {
                    clearTimeout(timeout);
                    this.logger.log(`Discord bot connected for tenant ${tenantId}: ${client.user?.tag}`);
                    resolve();
                });

                client.on('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });

                client.login(token).catch(reject);
            });

            // Store bot
            this.bots.set(tenantId, client);

            return true;
        } catch (error) {
            this.logger.error(`Failed to connect bot for tenant ${tenantId}:`, error);
            return false;
        }
    }

    /**
     * Disconnect a Discord bot for a tenant
     */
    async disconnectBot(tenantId: string) {
        const bot = this.bots.get(tenantId);
        if (bot) {
            bot.destroy();
            this.bots.delete(tenantId);
            this.logger.log(`Bot disconnected for tenant ${tenantId}`);
        }
    }

    /**
     * Get bot client for a tenant
     */
    getBot(tenantId: string): Client | undefined {
        return this.bots.get(tenantId);
    }

    /**
     * Verify bot token and get guild info
     */
    async verifyBotToken(token: string): Promise<{ valid: boolean; guilds?: Guild[]; botTag?: string; error?: string }> {
        try {
            const tempClient = new Client({
                intents: [GatewayIntentBits.Guilds],
            });

            // Wait for the bot to be ready before accessing guilds
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Bot login timeout'));
                }, 10000); // 10 second timeout

                tempClient.once('ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });

                tempClient.on('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });

                tempClient.login(token).catch(reject);
            });

            const guilds = Array.from(tempClient.guilds.cache.values());
            const botTag = tempClient.user?.tag;

            this.logger.log(`Bot verified: ${botTag}, guilds: ${guilds.length}`);

            tempClient.destroy();

            return {
                valid: true,
                guilds,
                botTag,
            };
        } catch (error) {
            this.logger.error('Bot token verification failed:', error.message || error);
            return {
                valid: false,
                error: error.message || 'Invalid bot token'
            };
        }
    }

    /**
     * Post message to a Discord channel
     */
    async postToChannel(
        tenantId: string,
        channelId: string,
        message: {
            title: string;
            description?: string;
            color?: number;
            fields?: { name: string; value: string; inline?: boolean }[];
            url?: string;
            footer?: string;
            thumbnail?: string;
        },
    ): Promise<boolean> {
        try {
            this.logger.log(`[postToChannel] Attempting to post to channel ${channelId} for tenant ${tenantId}`);

            const bot = this.bots.get(tenantId);
            if (!bot) {
                this.logger.warn(`[postToChannel] No bot connected for tenant ${tenantId}`);
                return false;
            }

            this.logger.log(`[postToChannel] Bot found, fetching channel ${channelId}...`);
            // Fetch channel
            const channel = await bot.channels.fetch(channelId);
            if (!channel) {
                this.logger.warn(`[postToChannel] Channel ${channelId} not found`);
                return false;
            }

            this.logger.log(`[postToChannel] Channel found: ${channel.type}, checking if text-based...`);
            // Check if it's a text channel and we can send messages
            if (!channel.isTextBased() || !('send' in channel)) {
                this.logger.warn(`[postToChannel] Channel ${channelId} is not a sendable text channel (type: ${channel.type})`);
                return false;
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(message.title)
                .setColor(message.color || 0x5865f2)
                .setFooter({ text: message.footer || 'ReplayHub' })
                .setTimestamp();

            if (message.description) {
                embed.setDescription(message.description);
            }

            if (message.url) {
                embed.setURL(message.url);
            }

            if (message.fields) {
                embed.addFields(message.fields);
            }

            if (message.thumbnail) {
                embed.setThumbnail(message.thumbnail);
            }

            this.logger.log(`[postToChannel] Embed created, sending to channel...`);
            // Send message to channel
            await (channel as any).send({ embeds: [embed] });

            this.logger.log(`[postToChannel] ✅ Message posted successfully to channel ${channelId}`);
            return true;
        } catch (error) {
            this.logger.error(`[postToChannel] ❌ Failed to post to channel ${channelId}:`, error.message, error.stack);
            return false;
        }
    }

    /**
     * Send DM to a Discord user
     */
    async sendDirectMessage(
        tenantId: string,
        discordUserId: string,
        message: {
            title: string;
            description?: string;
            color?: number;
            fields?: { name: string; value: string; inline?: boolean }[];
            url?: string;
        },
    ): Promise<boolean> {
        try {
            const bot = this.bots.get(tenantId);
            if (!bot) {
                this.logger.warn(`No bot connected for tenant ${tenantId}`);
                return false;
            }

            // Fetch user
            const user = await bot.users.fetch(discordUserId);
            if (!user) {
                this.logger.warn(`User ${discordUserId} not found`);
                return false;
            }

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(message.title)
                .setColor(message.color || 0x5865f2)
                .setFooter({ text: 'ReplayHub' })
                .setTimestamp();

            if (message.description) {
                embed.setDescription(message.description);
            }

            if (message.url) {
                embed.setURL(message.url);
            }

            if (message.fields) {
                embed.addFields(message.fields);
            }

            // Send DM
            await user.send({ embeds: [embed] });

            this.logger.log(`DM sent to ${user.tag} (${discordUserId})`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send DM to ${discordUserId}:`, error);
            return false;
        }
    }

    /**
     * Get list of channels in a guild
     */
    async getGuildChannels(tenantId: string, guildId: string) {
        try {
            this.logger.log(`Fetching channels for tenant ${tenantId}, guild ${guildId}`);

            const bot = this.bots.get(tenantId);
            if (!bot) {
                this.logger.warn(`No bot found for tenant ${tenantId}`);
                return [];
            }

            this.logger.log(`Bot found, fetching guild...`);
            const guild = await bot.guilds.fetch(guildId);
            if (!guild) {
                this.logger.warn(`Guild ${guildId} not found`);
                return [];
            }

            this.logger.log(`Guild found: ${guild.name}, fetching channels...`);
            const channels = guild.channels.cache
                .filter(channel => channel.type === 0) // Text channels only
                .map(channel => ({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type, // Return numeric type (0 = text, 2 = voice, etc.)
                }));

            this.logger.log(`Found ${channels.length} text channels`);
            return channels;
        } catch (error) {
            this.logger.error(`Failed to fetch channels for guild ${guildId}:`, error);
            return [];
        }
    }

    /**
     * Get list of roles in a guild
     */
    async getGuildRoles(tenantId: string, guildId: string) {
        try {
            const bot = this.bots.get(tenantId);
            if (!bot) {
                return [];
            }

            const guild = await bot.guilds.fetch(guildId);
            if (!guild) {
                return [];
            }

            const roles = guild.roles.cache
                .filter(role => !role.managed && role.name !== '@everyone')
                .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor,
                }));

            return roles;
        } catch (error) {
            this.logger.error(`Failed to fetch roles for guild ${guildId}:`, error);
            return [];
        }
    }

    /**
     * Check if user exists in Discord and get their info
     */
    async getUserInfo(tenantId: string, discordUserId: string) {
        try {
            const bot = this.bots.get(tenantId);
            if (!bot) {
                return null;
            }

            const user = await bot.users.fetch(discordUserId);
            if (!user) {
                return null;
            }

            return {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar,
                bot: user.bot,
            };
        } catch (error) {
            this.logger.error(`Failed to fetch user ${discordUserId}:`, error);
            return null;
        }
    }
}
