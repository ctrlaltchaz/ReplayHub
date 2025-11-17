import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const prisma = new PrismaClient();

/**
 * Run a database migration SQL file
 * 
 * Usage: npx ts-node -r tsconfig-paths/register scripts/run-migration.ts <migration-file>
 */
async function main() {
    const migrationFile = process.argv[2];

    if (!migrationFile) {
        console.error('❌ Please provide a migration file path');
        console.log('Usage: npx ts-node -r tsconfig-paths/register scripts/run-migration.ts <migration-file>');
        process.exit(1);
    }

    const migrationPath = path.resolve(process.cwd(), '../..', migrationFile);

    if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file not found: ${migrationPath}`);
        process.exit(1);
    }

    console.log(`\n🚀 Running migration: ${migrationFile}\n`);
    console.log(`   Path: ${migrationPath}\n`);

    // Get DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found in environment');
        process.exit(1);
    }

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();

        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log(`   Executing SQL...\n`);

        // Execute the entire SQL file
        await client.query(sql);

        console.log('   ✅ Success');
        console.log('\n✅ Migration completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
