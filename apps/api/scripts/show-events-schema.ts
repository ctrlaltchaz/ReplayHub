import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Show the structure of the events table
 */
async function main() {
  console.log('\n📋 Events table structure:\n');

  try {
    const columns = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string; is_nullable: string }>
    >`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'events'
            ORDER BY ordinal_position;
        `;

    console.log('   Columns:\n');
    columns.forEach(col => {
      console.log(
        `   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`
      );
    });

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
