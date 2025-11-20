import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrgAdmin() {
  try {
    // Get testorgg organization
    const org = await prisma.organisation.findFirst({
      where: { slug: 'testorgg' },
    });

    if (!org) {
      console.log('❌ Organization "testorgg" not found');
      return;
    }

    console.log(`✅ Found org: ${org.name} (${org.id})`);

    // Get all organisationAdmin records for this org
    const admins = await prisma.organisationAdmin.findMany({
      where: { organisationId: org.id },
      include: {
        globalUser: true,
      },
    });

    console.log(`\n📋 Organization Admins (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`  - ${admin.globalUser.email} (globalUserId: ${admin.globalUserId})`);
    });

    // Check for the specific user from the session
    const sessionUserId = 'cmh3kt6gv0000vr4kay34b56o';
    const userAdmin = await prisma.organisationAdmin.findFirst({
      where: {
        organisationId: org.id,
        globalUserId: sessionUserId,
      },
    });

    console.log(`\n🔍 Checking for session user (${sessionUserId}):`);
    if (userAdmin) {
      console.log(`✅ User IS an admin of this org`);
    } else {
      console.log(`❌ User is NOT an admin of this org`);

      // Show the actual global user
      const globalUser = await prisma.globalUser.findUnique({
        where: { id: sessionUserId },
      });

      if (globalUser) {
        console.log(`   Global user exists: ${globalUser.email}`);
        console.log(`   Need to add organisationAdmin record!`);
      } else {
        console.log(`   Global user does not exist in database!`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrgAdmin();
