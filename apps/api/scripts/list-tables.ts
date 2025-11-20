import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * List all tables in the database
 */
async function main() {
  console.log('\n📋 Listing all tables in database...\n');

  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `;

    if (tables.length === 0) {
      console.log('   ⚠️  No tables found in public schema');
    } else {
      console.log(`   Found ${tables.length} tables:\n`);
      tables.forEach((table, idx) => {
        console.log(`   ${idx + 1}. ${table.tablename}`);
      });
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
