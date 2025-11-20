// Database verification script with correct table names
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabaseTables() {
  console.log('=== PHASE 3 DATABASE VERIFICATION ===\n');

  try {
    // 1. Check if Phase 3 tables exist with correct snake_case names
    console.log('1) ✅ TABLES EXISTENCE CHECK:');

    const tableChecks = [
      { model: 'orgUser', name: 'OrgUser (org_users)' },
      { model: 'role', name: 'Role (roles)' },
      { model: 'permission', name: 'Permission (permissions)' },
      { model: 'rolePermission', name: 'RolePermission (role_permissions)' },
      { model: 'orgUserRole', name: 'OrgUserRole (org_user_roles)' },
      { model: 'orgInvite', name: 'OrgInvite (org_invites)' },
    ];

    for (const table of tableChecks) {
      try {
        await (prisma as any)[table.model].count();
        console.log(`   ✅ ${table.name}`);
      } catch (error) {
        console.log(`   ❌ ${table.name} - ${error.message}`);
      }
    }

    // 2. Check RLS policies with correct PostgreSQL system view
    console.log('\n2) 🔒 RLS POLICIES CHECK:');
    try {
      const policies = (await prisma.$queryRaw`
        SELECT 
          schemaname, 
          tablename, 
          policyname,
          SUBSTRING(COALESCE(qual, ''), 1, 100) as policy_condition
        FROM pg_policies 
        WHERE tablename IN ('org_users','roles','permissions','role_permissions','org_user_roles','org_invites')
        ORDER BY tablename, policyname;
      `) as any[];

      if (policies.length === 0) {
        console.log('   ❌ No RLS policies found');
      } else {
        console.log(`   ✅ Found ${policies.length} RLS policies:`);
        policies.forEach(policy => {
          console.log(`      📋 ${policy.tablename}.${policy.policyname}`);
          if (policy.policy_condition && policy.policy_condition.includes('app.tenant_id')) {
            console.log(`         🔒 Tenant isolation: ${policy.policy_condition}...`);
          }
        });
      }
    } catch (error) {
      console.log(`   ⚠️  RLS policy check failed: ${error.message}`);
    }

    // 3. Count seeded permissions
    console.log('\n3) 📊 SEEDED PERMISSIONS CHECK:');
    const permissionCount = await prisma.permission.count();
    const samplePermissions = await prisma.permission.findMany({
      take: 5,
      select: { key: true, group: true },
    });

    console.log(`   📈 Total permissions: ${permissionCount}`);
    console.log(`   📝 Sample permissions:`);
    samplePermissions.forEach(p => {
      console.log(`      - ${p.key} (group: ${p.group})`);
    });

    // 4. Check roles
    console.log('\n4) 👥 ROLES CHECK:');
    const roleCount = await prisma.role.count();
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    console.log(`   📊 Total roles: ${roleCount}`);
    roles.forEach(role => {
      console.log(`   🎭 ${role.name}: ${role.permissions.length} permissions`);
    });

    // 5. Check test organization
    console.log('\n5) 🏢 TEST ORGANIZATION CHECK:');
    const testOrg = await prisma.organisation.findUnique({
      where: { slug: 'testorg' },
      include: {
        admins: true,
      },
    });

    if (testOrg) {
      console.log(`   ✅ Test organization exists: ${testOrg.name} (ID: ${testOrg.id})`);
      console.log(`   👤 Admin count: ${testOrg.admins.length}`);
    } else {
      console.log(`   ❌ Test organization 'testorg' not found`);
    }

    // 6. Check org users
    console.log('\n6) 👤 ORG USERS CHECK:');
    const orgUserCount = await prisma.orgUser.count();
    console.log(`   📊 Total org users: ${orgUserCount}`);

    if (orgUserCount > 0) {
      const sampleOrgUsers = await prisma.orgUser.findMany({
        take: 3,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      sampleOrgUsers.forEach(user => {
        console.log(`   👤 ${user.email}: ${user.roles.length} role(s)`);
      });
    }
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseTables();
