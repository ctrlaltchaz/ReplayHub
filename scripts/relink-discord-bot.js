/**
 * Re-link Discord bot with current encryption key
 * Run this if you changed DISCORD_ENCRYPTION_KEY after linking the bot
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.DISCORD_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.error('❌ DISCORD_ENCRYPTION_KEY not found in .env.local');
    process.exit(1);
}

function encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv,
    );

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

async function relinkBot() {
    try {
        console.log('🔍 Looking for Discord configurations...');

        const configs = await prisma.organizationDiscord.findMany();

        console.log(`\nFound ${configs.length} Discord configuration(s)\n`);

        for (const config of configs) {
            console.log(`📝 Tenant ID: ${config.tenantId}`);
            console.log(`   Current bot token: ${config.botToken ? '***encrypted***' : 'none'}`);
            console.log(`   Guild ID: ${config.guildId || 'not set'}`);
            console.log(`   Guild Name: ${config.guildName || 'not set'}`);

            if (config.botToken) {
                // Bot token exists - ask if user wants to re-encrypt with new key
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                await new Promise((resolve) => {
                    readline.question('\n   Enter new bot token (or press Enter to skip): ', async (newToken) => {
                        readline.close();

                        if (newToken && newToken.trim()) {
                            // Re-encrypt with new token
                            const encrypted = encryptToken(newToken.trim());

                            await prisma.organizationDiscord.update({
                                where: { id: config.id },
                                data: { botToken: encrypted }
                            });

                            console.log(`   ✅ Bot token re-encrypted successfully\n`);
                        } else {
                            console.log(`   ⏭️  Skipped\n`);
                        }
                        resolve();
                    });
                });
            }
        }

        console.log('✅ Done!\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

relinkBot();
