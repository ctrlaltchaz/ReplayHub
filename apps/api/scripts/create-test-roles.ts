// List all permissions and create test roles
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPermissionsAndCreateRoles() {
  try {
    // Set tenant context to testorg
    const testOrg = await prisma.organisation.findUnique({
      where: { slug: 'testorg' },
    });

    if (!testOrg) {
      console.log('❌ Test org not found');
      return;
    }

    await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${testOrg.id}, true)`;
    console.log(`🏢 Set tenant context to: ${testOrg.name} (${testOrg.id})\n`);

    // List all permissions
    console.log('=== ALL SEEDED PERMISSIONS ===');
    const allPermissions = await prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    console.log(`📊 Total: ${allPermissions.length} permissions\n`);

    const groupedPermissions = allPermissions.reduce(
      (acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm.key);
        return acc;
      },
      {} as Record<string, string[]>
    );

    Object.entries(groupedPermissions).forEach(([group, perms]: [string, string[]]) => {
      console.log(`📂 ${group.toUpperCase()}:`);
      perms.forEach(key => console.log(`   - ${key}`));
      console.log('');
    });

    // Create specific test roles
    console.log('=== CREATING TEST ROLES ===');

    // Create ops_admin role
    const opsAdminPerms = allPermissions.filter(p =>
      [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'roles.create',
        'roles.read',
        'roles.update',
        'roles.delete',
        'invites.create',
        'invites.read',
        'invites.delete',
      ].includes(p.key)
    );

    try {
      const opsAdmin = await prisma.role.create({
        data: {
          name: 'ops_admin',
          desc: 'Operations Administrator - full access',
          tenantId: testOrg.id,
          permissions: {
            create: opsAdminPerms.map(p => ({
              permissionId: p.id,
              tenantId: testOrg.id,
            })),
          },
        },
      });
      console.log(`✅ ops_admin role created with ${opsAdminPerms.length} permissions`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ ops_admin role already exists');
      } else {
        throw error;
      }
    }

    // Create producer role (moderate access)
    const producerPerms = allPermissions.filter(p => ['users.read', 'roles.read'].includes(p.key));

    try {
      const producer = await prisma.role.create({
        data: {
          name: 'producer',
          desc: 'Producer - read access with some edit rights',
          tenantId: testOrg.id,
          permissions: {
            create: producerPerms.map(p => ({
              permissionId: p.id,
              tenantId: testOrg.id,
            })),
          },
        },
      });
      console.log(`✅ producer role created with ${producerPerms.length} permissions`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ producer role already exists');
      } else {
        throw error;
      }
    }

    // Create viewer role (minimal access)
    const viewerPerms = allPermissions.filter(p => ['users.read'].includes(p.key));

    try {
      const viewer = await prisma.role.create({
        data: {
          name: 'viewer',
          desc: 'Viewer - read-only access',
          tenantId: testOrg.id,
          permissions: {
            create: viewerPerms.map(p => ({
              permissionId: p.id,
              tenantId: testOrg.id,
            })),
          },
        },
      });
      console.log(`✅ viewer role created with ${viewerPerms.length} permissions`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ viewer role already exists');
      } else {
        throw error;
      }
    }

    // List final role summary
    console.log('\n=== FINAL ROLE SUMMARY ===');
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    roles.forEach(role => {
      const permList = role.permissions.map(rp => rp.permission.key).sort();
      console.log(`🎭 ${role.name}: ${permList.length} permissions`);
      console.log(`   Permissions: [${permList.join(', ')}]`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPermissionsAndCreateRoles();
