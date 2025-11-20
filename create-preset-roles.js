const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PRESET_ROLES = [
  {
    name: 'ADMIN',
    description: 'Full administrative access to all features',
    permissions: [
      // All permissions - full access
      'calendar.view',
      'calendar.manage',
      'events.view',
      'events.create',
      'events.edit',
      'events.delete',
      'events.manage',
      'runsheet.view',
      'runsheet.edit',
      'runsheet.approve',
      'runsheet.lock',
      'resources.view',
      'resources.manage',
      'checklists.view',
      'checklists.run',
      'checklists.manage',
      'inventory.view',
      'inventory.update',
      'inventory.book',
      'assets.upload',
      'assets.approve',
      'assets.manage',
      'roster.view',
      'roster.manage',
      'team.create',
      'team.update',
      'team.archive',
      'team.select_lineup',
      'player.create',
      'player.update',
      'player.link_user',
      'players.view',
      'players.edit_profile_self',
      'players.edit_admin',
      'availability.manage',
      'availability.set_self',
      'lineup.create',
      'lineup.update',
      'lineup.publish',
      'achievement.create',
      'achievement.approve',
      'achievements.create',
      'achievements.approve',
      'gamelog.view',
      'gamelog.manage',
      'gamelog.approve',
      'stats.record',
      'stats.edit',
      'stats.approve',
      'reports.view',
      'reports.export',
      'incidents.view',
      'incidents.create',
      'incidents.manage',
      'attendance.view',
      'attendance.manage',
      'attendance.export',
      'users.view',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'invites.create',
      'invites.read',
      'invites.delete',
      'org.settings.view',
      'org.settings.manage',
      'org.users.view',
      'org.users.manage',
      'org.roles.view',
      'org.roles.manage',
      'org.invites.view',
      'org.invites.manage',
      'org.audit.view',
      'feedback.submit',
    ],
  },
  {
    name: 'TUTOR',
    description: 'Educational coordinator with roster and training management',
    permissions: [
      'calendar.view',
      'calendar.manage',
      'events.view',
      'events.create',
      'events.edit',
      'roster.view',
      'roster.manage',
      'team.create',
      'team.update',
      'team.select_lineup',
      'player.create',
      'player.update',
      'players.view',
      'players.edit_admin',
      'availability.manage',
      'availability.set_self',
      'lineup.create',
      'lineup.update',
      'gamelog.view',
      'stats.record',
      'stats.edit',
      'reports.view',
      'attendance.view',
      'attendance.manage',
      'attendance.export',
      'checklists.view',
      'checklists.run',
      'users.view',
      'users.read',
      'feedback.submit',
    ],
  },
  {
    name: 'PRODUCER',
    description: 'Production lead with event and runsheet management',
    permissions: [
      'calendar.view',
      'calendar.manage',
      'events.view',
      'events.create',
      'events.edit',
      'events.manage',
      'runsheet.view',
      'runsheet.edit',
      'runsheet.approve',
      'resources.view',
      'resources.manage',
      'checklists.view',
      'checklists.run',
      'checklists.manage',
      'inventory.view',
      'inventory.update',
      'inventory.book',
      'assets.upload',
      'assets.approve',
      'assets.manage',
      'roster.view',
      'players.view',
      'gamelog.view',
      'incidents.view',
      'incidents.create',
      'incidents.manage',
      'users.view',
      'users.read',
      'reports.view',
      'reports.export',
      'feedback.submit',
    ],
  },
  {
    name: 'DIRECTOR',
    description: 'Broadcast director with production oversight',
    permissions: [
      'calendar.view',
      'events.view',
      'events.edit',
      'runsheet.view',
      'runsheet.edit',
      'resources.view',
      'resources.manage',
      'checklists.view',
      'checklists.run',
      'inventory.view',
      'inventory.book',
      'assets.upload',
      'assets.manage',
      'roster.view',
      'players.view',
      'gamelog.view',
      'incidents.view',
      'incidents.create',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'BROADCASTER',
    description: 'On-air talent with commentary and streaming access',
    permissions: [
      'calendar.view',
      'events.view',
      'runsheet.view',
      'checklists.view',
      'roster.view',
      'players.view',
      'availability.set_self',
      'gamelog.view',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'SOCIAL MEDIA MANAGER',
    description: 'Social media lead with content and asset management',
    permissions: [
      'calendar.view',
      'events.view',
      'assets.upload',
      'assets.approve',
      'assets.manage',
      'roster.view',
      'players.view',
      'gamelog.view',
      'gamelog.manage',
      'reports.view',
      'reports.export',
      'achievement.create',
      'achievement.approve',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'SOCIAL MEDIA ASSISTANT',
    description: 'Social media support with content creation',
    permissions: [
      'calendar.view',
      'events.view',
      'assets.upload',
      'roster.view',
      'players.view',
      'gamelog.view',
      'achievement.create',
      'feedback.submit',
    ],
  },
  {
    name: 'SHOUTCASTER',
    description: 'Commentary talent with match and roster viewing',
    permissions: [
      'calendar.view',
      'events.view',
      'roster.view',
      'players.view',
      'availability.set_self',
      'gamelog.view',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'TECHNICIAN',
    description: 'Technical support with equipment and incident management',
    permissions: [
      'calendar.view',
      'events.view',
      'runsheet.view',
      'resources.view',
      'resources.manage',
      'checklists.view',
      'checklists.run',
      'inventory.view',
      'inventory.update',
      'inventory.book',
      'incidents.view',
      'incidents.create',
      'incidents.manage',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'CAPTAIN',
    description: 'Team captain with roster and lineup management',
    permissions: [
      'calendar.view',
      'events.view',
      'roster.view',
      'roster.manage',
      'team.update',
      'team.select_lineup',
      'player.update',
      'players.view',
      'players.edit_profile_self',
      'availability.manage',
      'availability.set_self',
      'lineup.create',
      'lineup.update',
      'gamelog.view',
      'stats.record',
      'users.view',
      'feedback.submit',
    ],
  },
  {
    name: 'PLAYER',
    description: 'Team member with personal profile and availability management',
    permissions: [
      'calendar.view',
      'events.view',
      'roster.view',
      'players.view',
      'players.edit_profile_self',
      'availability.set_self',
      'gamelog.view',
      'feedback.submit',
    ],
  },
  {
    name: 'GENERAL ASSISTANT',
    description: 'Support staff with basic viewing and task access',
    permissions: [
      'calendar.view',
      'events.view',
      'checklists.view',
      'checklists.run',
      'roster.view',
      'players.view',
      'gamelog.view',
      'users.view',
      'feedback.submit',
    ],
  },
];

async function createPresetRoles() {
  try {
    // Get the organization slug from command line argument
    const orgSlug = process.argv[2];

    if (!orgSlug) {
      console.error('❌ Please provide organization slug as argument');
      console.error('Usage: node create-preset-roles.js <org-slug>');
      process.exit(1);
    }

    // Find the organization
    const org = await prisma.organisation.findUnique({
      where: { slug: orgSlug },
    });

    if (!org) {
      console.error(`❌ Organization with slug "${orgSlug}" not found`);
      process.exit(1);
    }

    console.log(`\n🎭 Creating preset roles for organization: ${org.name} (${org.slug})\n`);

    let created = 0;
    let skipped = 0;

    for (const roleData of PRESET_ROLES) {
      // Check if role already exists
      const existing = await prisma.role.findFirst({
        where: {
          tenantId: org.id,
          name: roleData.name,
        },
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${roleData.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create the role
      const role = await prisma.role.create({
        data: {
          tenantId: org.id,
          name: roleData.name,
          desc: roleData.description,
        },
      });

      // Look up permission IDs for this organization
      const permissions = await prisma.permission.findMany({
        where: {
          tenantId: org.id,
          key: {
            in: roleData.permissions,
          },
        },
      });

      if (permissions.length === 0) {
        console.log(
          `⚠️  Warning: No permissions found for ${roleData.name}, skipping permission assignment`
        );
      } else {
        // Create role-permission associations
        const permissionRecords = permissions.map(permission => ({
          roleId: role.id,
          tenantId: org.id,
          permissionId: permission.id,
        }));

        await prisma.rolePermission.createMany({
          data: permissionRecords,
        });

        console.log(
          `✅ Created: ${roleData.name} (${permissions.length}/${roleData.permissions.length} permissions)`
        );
      }

      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} roles`);
    console.log(`   ⏭️  Skipped: ${skipped} roles`);
    console.log(`\n🎉 Done!`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createPresetRoles();
