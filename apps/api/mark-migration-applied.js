const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL explicitly
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public';

const prisma = new PrismaClient();

async function markMigrationAsApplied() {
  try {
    console.log('📝 Marking migration as applied in _prisma_migrations table...\n');

    const migrationName = '20251209204343_add_team_map_pool';
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');

    const migrationFile = path.join(__dirname, 'prisma', 'migrations', migrationName, 'migration.sql');
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    const checksum = crypto.createHash('sha256').update(migrationSQL).digest('hex');

    // Check if migration already exists
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM "_prisma_migrations" WHERE migration_name = '${migrationName}'`
    );

    if (existing.length > 0) {
      console.log('⚠️  Migration already marked as applied.');
      return;
    }

    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (
        gen_random_uuid(),
        '${checksum}',
        NOW(),
        '${migrationName}',
        NULL,
        NULL,
        NOW(),
        1
      );
    `);

    console.log('✅ Migration marked as applied!');
    console.log(`   Migration: ${migrationName}\n`);
  } catch (error) {
    console.error('❌ Failed to mark migration:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

markMigrationAsApplied();
