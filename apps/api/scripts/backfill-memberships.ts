import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function backfillMemberships() {
  console.log('🚀 Starting membership backfill...');

  const orgUsers = await prisma.orgUser.findMany();
  console.log(`Found ${orgUsers.length} org users to process`);

  let createdGlobal = 0;
  let createdMemberships = 0;

  for (const orgUser of orgUsers) {
    const tenantId = orgUser.tenantId;
    const email = orgUser.email;

    // Resolve or create GlobalUser
    let globalUser = orgUser.globalUserId
      ? await prisma.globalUser.findUnique({ where: { id: orgUser.globalUserId } })
      : null;

    if (!globalUser) {
      globalUser = await prisma.globalUser.findFirst({ where: { email } });
    }

    if (!globalUser) {
      globalUser = await prisma.globalUser.create({
        data: {
          email,
          passwordHash: orgUser.passwordHash,
          name: orgUser.displayName,
          isActive: orgUser.isActive,
          isTotpEnabled: orgUser.isTotpEnabled,
        },
      });
      createdGlobal++;
      console.log(`Created GlobalUser ${globalUser.id} for org user ${orgUser.id}`);
    }

    // Ensure membership exists
    const existingMembership = await prisma.userOrganisationMembership.findFirst({
      where: { tenantId, userId: globalUser.id },
    });

    if (!existingMembership) {
      await prisma.userOrganisationMembership.create({
        data: {
          tenantId,
          userId: globalUser.id,
          email,
          displayName: orgUser.displayName,
          isActive: orgUser.isActive,
          isTotpEnabled: orgUser.isTotpEnabled,
        },
      });
      createdMemberships++;
      console.log(
        `Created membership for tenant ${tenantId} and global user ${globalUser.id} (org user ${orgUser.id})`
      );
    }
  }

  console.log('✅ Backfill complete');
  console.log(`Global users created: ${createdGlobal}`);
  console.log(`Memberships created: ${createdMemberships}`);
}

backfillMemberships()
  .catch(err => {
    console.error('❌ Backfill failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
