import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedPhase3TestData() {
  try {
    // Get the testorg organization ID
    const org = await prisma.organisation.findFirst({
      where: { slug: 'testorg' },
    });

    if (!org) {
      throw new Error('Organization "testorg" not found. Run create-test-org.js first.');
    }

    const tenantId = org.id;
    await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

    console.log('🌱 Seeding Phase 3 test data for tenant:', tenantId);

    // 1. Create default roles and permissions
    console.log('Creating default permissions...');
    const permissions = [
      { key: 'users.create', group: 'users', desc: 'Create new org users' },
      { key: 'users.read', group: 'users', desc: 'View org users' },
      { key: 'users.update', group: 'users', desc: 'Edit org users' },
      { key: 'users.delete', group: 'users', desc: 'Remove org users' },
      { key: 'roles.create', group: 'roles', desc: 'Create new roles' },
      { key: 'roles.read', group: 'roles', desc: 'View roles' },
      { key: 'roles.update', group: 'roles', desc: 'Edit roles' },
      { key: 'roles.delete', group: 'roles', desc: 'Remove roles' },
      { key: 'invites.create', group: 'invites', desc: 'Send user invitations' },
      { key: 'invites.read', group: 'invites', desc: 'View invitations' },
      { key: 'invites.delete', group: 'invites', desc: 'Revoke invitations' },

      // Roster Management Permissions
      { key: 'roster.view', group: 'roster', desc: 'View rosters and teams' },
      { key: 'roster.manage', group: 'roster', desc: 'Manage team rosters and memberships' },

      // Team Management
      { key: 'team.create', group: 'teams', desc: 'Create new teams' },
      { key: 'team.update', group: 'teams', desc: 'Edit team details' },
      { key: 'team.archive', group: 'teams', desc: 'Archive teams' },

      // Player Management
      { key: 'player.create', group: 'players', desc: 'Create new players' },
      { key: 'player.update', group: 'players', desc: 'Edit player profiles' },
      { key: 'player.link_user', group: 'players', desc: 'Link players to org users' },

      // Availability Management
      { key: 'availability.set_self', group: 'availability', desc: 'Set own availability' },
      { key: 'availability.manage', group: 'availability', desc: 'Manage player availability' },

      // Lineup Management
      { key: 'lineup.create', group: 'lineups', desc: 'Create event lineups' },
      { key: 'lineup.update', group: 'lineups', desc: 'Modify lineup rosters' },
      { key: 'lineup.publish', group: 'lineups', desc: 'Publish finalized lineups' },

      // Achievement Tracking
      { key: 'achievement.create', group: 'achievements', desc: 'Record achievements' },
      { key: 'achievement.approve', group: 'achievements', desc: 'Approve achievements' },

      // Reports and Exports
      { key: 'reports.view', group: 'reports', desc: 'View roster reports' },
      { key: 'reports.export', group: 'reports', desc: 'Export roster sheets and call sheets' },

      // GameLog Permissions
      { key: 'gamelog.view', group: 'gamelog', desc: 'View match logs and statistics' },
      { key: 'gamelog.manage', group: 'gamelog', desc: 'Create and edit match records' },
      { key: 'gamelog.approve', group: 'gamelog', desc: 'Approve match submissions' },
      { key: 'stats.record', group: 'stats', desc: 'Record player statistics' },
      { key: 'stats.edit', group: 'stats', desc: 'Edit existing statistics' },
      { key: 'stats.approve', group: 'stats', desc: 'Approve statistical submissions' },

      // Scheduling Permissions
      { key: 'events.view', group: 'events', desc: 'View events and calendar' },
      { key: 'events.manage', group: 'events', desc: 'Create and manage events' },
      { key: 'resources.view', group: 'resources', desc: 'View resources and bookings' },
      { key: 'resources.manage', group: 'resources', desc: 'Manage resources and bookings' },
      { key: 'exports.view', group: 'exports', desc: 'Generate and download exports' },
    ];

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: {
          tenantId_key: { tenantId, key: permission.key },
        },
        update: {},
        create: {
          tenantId,
          ...permission,
        },
      });
    }

    console.log('Creating default roles...');

    // Admin role with all permissions
    const adminRole = await prisma.role.upsert({
      where: {
        tenantId_name: { tenantId, name: 'Admin' },
      },
      update: {},
      create: {
        tenantId,
        name: 'Admin',
        desc: 'Full administrative access',
      },
    });

    // Manager role with user management permissions
    const managerRole = await prisma.role.upsert({
      where: {
        tenantId_name: { tenantId, name: 'Manager' },
      },
      update: {},
      create: {
        tenantId,
        name: 'Manager',
        desc: 'User and team management access',
      },
    });

    // User role with basic permissions
    const userRole = await prisma.role.upsert({
      where: {
        tenantId_name: { tenantId, name: 'User' },
      },
      update: {},
      create: {
        tenantId,
        name: 'User',
        desc: 'Basic user access',
      },
    });

    console.log('Assigning permissions to roles...');

    // Get all permissions
    const allPermissions = await prisma.permission.findMany({
      where: { tenantId },
    });

    // Assign all permissions to Admin role
    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          tenantId_roleId_permissionId: {
            tenantId,
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          tenantId,
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Assign user management permissions to Manager role
    const userMgmtPermissions = allPermissions.filter(
      p => (p.group === 'users' || p.group === 'invites') && !p.key.includes('delete')
    );

    for (const permission of userMgmtPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          tenantId_roleId_permissionId: {
            tenantId,
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          tenantId,
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
    }

    // Assign read permissions to User role
    const readPermissions = allPermissions.filter(p => p.key.includes('.read'));

    for (const permission of readPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          tenantId_roleId_permissionId: {
            tenantId,
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          tenantId,
          roleId: userRole.id,
          permissionId: permission.id,
        },
      });
    }

    // 2. Create test org users
    console.log('Creating test org users...');

    const passwordHash = await bcrypt.hash('TestPassword123!', 12);

    // Admin user
    const adminUser = await prisma.orgUser.upsert({
      where: {
        tenantId_email: { tenantId, email: 'admin@testorg.com' },
      },
      update: {},
      create: {
        tenantId,
        email: 'admin@testorg.com',
        passwordHash,
        displayName: 'Test Admin',
        isActive: true,
      },
    });

    // Manager user
    const managerUser = await prisma.orgUser.upsert({
      where: {
        tenantId_email: { tenantId, email: 'manager@testorg.com' },
      },
      update: {},
      create: {
        tenantId,
        email: 'manager@testorg.com',
        passwordHash,
        displayName: 'Test Manager',
        isActive: true,
      },
    });

    // Regular user
    const regularUser = await prisma.orgUser.upsert({
      where: {
        tenantId_email: { tenantId, email: 'user@testorg.com' },
      },
      update: {},
      create: {
        tenantId,
        email: 'user@testorg.com',
        passwordHash,
        displayName: 'Test User',
        isActive: true,
      },
    });

    console.log('Assigning roles to users...');

    // Assign Admin role to admin user
    await prisma.orgUserRole.upsert({
      where: {
        tenantId_orgUserId_roleId: {
          tenantId,
          orgUserId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        tenantId,
        orgUserId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    // Assign Manager role to manager user
    await prisma.orgUserRole.upsert({
      where: {
        tenantId_orgUserId_roleId: {
          tenantId,
          orgUserId: managerUser.id,
          roleId: managerRole.id,
        },
      },
      update: {},
      create: {
        tenantId,
        orgUserId: managerUser.id,
        roleId: managerRole.id,
      },
    });

    // Assign User role to regular user
    await prisma.orgUserRole.upsert({
      where: {
        tenantId_orgUserId_roleId: {
          tenantId,
          orgUserId: regularUser.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        tenantId,
        orgUserId: regularUser.id,
        roleId: userRole.id,
      },
    });

    console.log('✅ Phase 3 test data seeded successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👑 Admin: admin@testorg.com / TestPassword123!');
    console.log('👔 Manager: manager@testorg.com / TestPassword123!');
    console.log('👤 User: user@testorg.com / TestPassword123!');
    console.log('\n🏢 Tenant: testorg');
    console.log('🌐 Test URLs:');
    console.log('   Login: POST http://localhost:3001/api/org/testorg/auth/login');
    console.log('   Profile: GET http://localhost:3001/api/org/testorg/auth/profile');
    console.log('   Users: GET http://localhost:3001/api/org/testorg/users');
    console.log('   Roles: GET http://localhost:3001/api/org/testorg/roles');
  } catch (error) {
    console.error('❌ Error seeding Phase 3 test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPhase3TestData();
