const { PrismaClient } = require('@prisma/client');

// Set DATABASE_URL explicitly
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('🔄 Applying map_pool_json migration...\n');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS map_pool_json JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('✅ Migration applied successfully!');
    console.log('   The map_pool_json column has been added to the teams table.\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
