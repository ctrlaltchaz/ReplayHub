// Simple table existence check
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Check actual table names in database
    const tables = (await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `) as any[];

    console.log('=== EXISTING DATABASE TABLES ===');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    // Check for specific Phase 3 tables
    console.log('\n=== PHASE 3 TABLE CHECK ===');
    const phase3Tables = [
      'OrgUser',
      'Role',
      'Permission',
      'RolePermission',
      'OrgUserRole',
      'OrgInvite',
    ];
    const existingTableNames = tables.map(t => t.table_name);

    phase3Tables.forEach(tableName => {
      const exists = existingTableNames.includes(tableName);
      console.log(`${exists ? '✅' : '❌'} ${tableName}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
