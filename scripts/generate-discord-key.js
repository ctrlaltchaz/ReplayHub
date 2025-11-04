#!/usr/bin/env node

/**
 * Generate a secure encryption key for Discord bot token encryption
 * Run: node scripts/generate-discord-key.js
 */

const crypto = require('crypto');

console.log('\n🔐 Discord Encryption Key Generator\n');
console.log('═'.repeat(50));

const key = crypto.randomBytes(32).toString('hex');

console.log('\nYour secure encryption key:\n');
console.log(`DISCORD_ENCRYPTION_KEY=${key}`);
console.log('\n' + '═'.repeat(50));
console.log('\n✅ Copy this to your .env file');
console.log('⚠️  Keep this secret and never commit it to version control\n');
