// Database verification script
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabaseTables() {
    console.log('=== PHASE 3 DATABASE VERIFICATION ===\n');

    try {
        // 1. Check if tables exist by attempting to query them
        console.log('1) Checking table existence:');

        const tables = [
            'OrgUser', 'Role', 'Permission',
            'RolePermission', 'OrgUserRole', 'OrgInvite'
        ];

        for (const table of tables) {
            try {
                await (prisma as any)[table.toLowerCase()].count();
                console.log(`   ✅ ${table} table exists`);
            } catch (error) {
                console.log(`   ❌ ${table} table missing or inaccessible`);
            }
        }

        // 2. Check RLS policies
        console.log('\n2) Checking RLS policies:');
        const policies = await prisma.$queryRaw`
      SELECT tablename, polname, qual 
      FROM pg_policies 
      WHERE tablename IN ('OrgUser','Role','Permission','RolePermission','OrgUserRole','OrgInvite')
      ORDER BY tablename, polname;
    ` as any[];

        if (policies.length === 0) {
            console.log('   ❌ No RLS policies found');
        } else {
            policies.forEach(policy => {
                console.log(`   ✅ ${policy.tablename}: ${policy.polname}`);
                if (policy.qual && policy.qual.includes('app.tenant_id')) {
                    console.log(`      🔒 Tenant isolation: ${policy.qual.substring(0, 80)}...`);
                }
            });
        }

        // 3. Count seeded permissions
        console.log('\n3) Checking seeded permissions:');
        const permissionCount = await prisma.permission.count();
        const samplePermissions = await prisma.permission.findMany({
            take: 5,
            select: { key: true, group: true }
        });

        console.log(`   📊 Total permissions: ${permissionCount}`);
        console.log(`   📝 Sample permissions:`);
        samplePermissions.forEach(p => {
            console.log(`      - ${p.key} (group: ${p.group})`);
        });

        // 4. Check organizations
        console.log('\n4) Checking organizations:');
        const orgCount = await prisma.organisation.count();
        const testOrg = await prisma.organisation.findUnique({
            where: { slug: 'testorg' }
        });

        console.log(`   🏢 Total organizations: ${orgCount}`);
        if (testOrg) {
            console.log(`   ✅ Test organization exists: ${testOrg.name} (ID: ${testOrg.id})`);
        } else {
            console.log(`   ❌ Test organization 'testorg' not found`);
        }

    } catch (error) {
        console.error('❌ Database verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDatabaseTables();