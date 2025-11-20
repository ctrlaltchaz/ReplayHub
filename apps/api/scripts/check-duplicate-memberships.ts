import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate userId+tenantId combinations...');

  const duplicates = (await prisma.$queryRaw`
        SELECT user_id, tenant_id, COUNT(*) as count 
        FROM user_org_memberships 
        GROUP BY user_id, tenant_id 
        HAVING COUNT(*) > 1
    `) as any[];

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Safe to add unique constraint.');
  } else {
    console.log('❌ Found duplicates:');
    console.table(duplicates);
  }
}

main()
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
