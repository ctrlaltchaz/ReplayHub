import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const organisations = await prisma.organisation.findMany({ select: { id: true } });
  console.log(`Found ${organisations.length} organisations`);

  for (const organisation of organisations) {
    const { id: tenantId } = organisation;

    const keys = [
      { key: 'attendance.view', group: 'attendance', desc: 'View Wednesday attendance dashboard' },
      {
        key: 'attendance.manage',
        group: 'attendance',
        desc: 'Review, edit, and override attendance entries',
      },
      { key: 'attendance.export', group: 'attendance', desc: 'Export Wednesday attendance data' },
    ];

    for (const { key, group, desc } of keys) {
      const permission = await prisma.permission.upsert({
        where: { tenantId_key: { tenantId, key } },
        update: {},
        create: {
          tenantId,
          key,
          group,
          desc,
        },
      });

      console.log(`Ensured ${key} for tenant ${tenantId}: ${permission.id}`);
    }

    for (const roleName of ['ADMIN', 'TUTOR']) {
      const role = await prisma.role.findFirst({
        where: {
          tenantId,
          name: roleName,
        },
        select: { id: true },
      });

      if (!role) {
        console.warn(`Role ${roleName} not found for tenant ${tenantId}`);
        continue;
      }

      const perms = await prisma.permission.findMany({
        where: {
          tenantId,
          key: { in: keys.map(k => k.key) },
        },
        select: { id: true, key: true },
      });

      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: {
            tenantId_roleId_permissionId: {
              tenantId,
              roleId: role.id,
              permissionId: perm.id,
            },
          },
          update: {},
          create: {
            tenantId,
            roleId: role.id,
            permissionId: perm.id,
          },
        });

        console.log(`Ensured ${perm.key} on ${roleName} (${tenantId})`);
      }
    }
  }
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
