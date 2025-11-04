#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('✓ Connected to database');

        // Apply Discord migration schema changes
        console.log('Applying migration changes...');

        // Add ALL missing columns to global_users
        await client.query(`
            ALTER TABLE global_users 
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS location TEXT,
            ADD COLUMN IF NOT EXISTS timezone TEXT,
            ADD COLUMN IF NOT EXISTS social_links JSONB,
            ADD COLUMN IF NOT EXISTS pending_email TEXT,
            ADD COLUMN IF NOT EXISTS email_verification_code TEXT,
            ADD COLUMN IF NOT EXISTS email_verification_expiry TIMESTAMP(3);
        `);
        console.log('✓ Added global_users columns');

        // Add columns to checklists
        await client.query(`
            ALTER TABLE checklists 
            ADD COLUMN IF NOT EXISTS completed_items JSONB NOT NULL DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS items_json JSONB,
            ADD COLUMN IF NOT EXISTS scope TEXT,
            ADD COLUMN IF NOT EXISTS title TEXT,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✓ Added checklists columns');

        // Alter inventory_movements
        await client.query(`
            ALTER TABLE inventory_movements 
            ALTER COLUMN by_user_id DROP NOT NULL;
        `);
        console.log('✓ Updated inventory_movements');

        // Create Discord tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS organization_discord (
                id TEXT NOT NULL PRIMARY KEY,
                tenant_id TEXT NOT NULL UNIQUE,
                bot_token TEXT,
                guild_id TEXT,
                guild_name TEXT,
                webhook_events TEXT,
                webhook_matches TEXT,
                webhook_roster TEXT,
                webhook_incidents TEXT,
                enable_channel_notifications BOOLEAN NOT NULL DEFAULT true,
                enable_user_dms BOOLEAN NOT NULL DEFAULT false,
                enable_event_notifications BOOLEAN NOT NULL DEFAULT true,
                enable_match_notifications BOOLEAN NOT NULL DEFAULT true,
                enable_roster_notifications BOOLEAN NOT NULL DEFAULT true,
                enable_incident_notifications BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(3) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS organization_discord_tenant_id_idx ON organization_discord(tenant_id);
        `);
        console.log('✓ Created organization_discord table');

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_discord_links (
                id TEXT NOT NULL PRIMARY KEY,
                global_user_id TEXT NOT NULL UNIQUE,
                discord_id TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                discriminator TEXT,
                avatar TEXT,
                enable_dms BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(3) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS user_discord_links_discord_id_idx ON user_discord_links(discord_id);
        `);
        console.log('✓ Created user_discord_links table');

        await client.query(`
            CREATE TABLE IF NOT EXISTS discord_notification_logs (
                id TEXT NOT NULL PRIMARY KEY,
                tenant_id TEXT NOT NULL,
                notification_type TEXT NOT NULL,
                delivery_method TEXT NOT NULL,
                recipient_id TEXT,
                channel_id TEXT,
                message_id TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                error_message TEXT,
                payload JSONB,
                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS discord_notification_logs_tenant_id_idx 
                ON discord_notification_logs(tenant_id, notification_type, status);
            CREATE INDEX IF NOT EXISTS discord_notification_logs_created_at_idx 
                ON discord_notification_logs(created_at);
        `);
        console.log('✓ Created discord_notification_logs table');

        // Mark migration as applied in Prisma
        const existingMigration = await client.query(`
            SELECT id FROM _prisma_migrations WHERE migration_name = '20251031193634_add_discord_integration'
        `);

        if (existingMigration.rows.length === 0) {
            await client.query(`
                INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
                VALUES (
                    gen_random_uuid()::text,
                    'migration_checksum',
                    NOW(),
                    '20251031193634_add_discord_integration',
                    NULL,
                    NULL,
                    NOW(),
                    1
                );
            `);
            console.log('✓ Marked migration as applied');
        } else {
            console.log('✓ Migration already marked as applied');
        }

        await client.end();
        console.log('');
        console.log('✅ Migration applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        await client.end();
        process.exit(1);
    }
}

applyMigration();
