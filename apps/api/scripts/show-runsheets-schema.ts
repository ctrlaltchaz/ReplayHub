import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n📋 Runsheets table structure:\n');

  const columns = await prisma.$queryRaw<
    Array<{ column_name: string; data_type: string; is_nullable: string }>
  >`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'runsheets'
        ORDER BY ordinal_position;
    `;

  columns.forEach(col => {
    console.log(
      `   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`
    );
  });

  console.log('\n');
}

main().finally(async () => await prisma.$disconnect());
