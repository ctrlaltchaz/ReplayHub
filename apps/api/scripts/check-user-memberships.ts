import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'charlie@mckeonwebsolutions.com';

  console.log(`\n=== Checking memberships for: ${email} ===\n`);

  // Find global user
  const globalUser = await prisma.globalUser.findUnique({
    where: { email },
  });

  if (!globalUser) {
    console.log('❌ No global user found with this email');
    return;
  }

  console.log(`✅ Global User: ${globalUser.id}`);
  console.log(`   Name: ${globalUser.name}`);
  console.log(`   Email: ${globalUser.email}`);
  console.log(`   Is Global Admin: ${globalUser.isGlobalAdmin}`);

  // Find memberships
  const memberships = await prisma.userOrganisationMembership.findMany({
    where: { userId: globalUser.id },
    include: {
      organisation: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      roles: {
        include: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  console.log(`\n📋 Memberships (${memberships.length}):`);

  if (memberships.length === 0) {
    console.log('   ⚠️  No memberships found!');
  } else {
    memberships.forEach((membership, idx) => {
      console.log(`\n   ${idx + 1}. ${membership.organisation?.name || 'Unknown Org'}`);
      console.log(`      ID: ${membership.id}`);
      console.log(`      Slug: ${membership.organisation?.slug || 'N/A'}`);
      console.log(`      Email: ${membership.email}`);
      console.log(`      Display Name: ${membership.displayName || 'N/A'}`);
      console.log(`      Active: ${membership.isActive}`);
      console.log(`      Roles: ${membership.roles.map(r => r.role.name).join(', ') || 'None'}`);
    });
  }

  // Check for old OrgUser entries (deprecated)
  const orgUsers = await prisma.orgUser.findMany({
    where: {
      globalUserId: globalUser.id,
    },
    include: {
      organisation: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (orgUsers.length > 0) {
    console.log(`\n⚠️  Found ${orgUsers.length} old OrgUser entries (deprecated):`);
    orgUsers.forEach((ou, idx) => {
      console.log(`   ${idx + 1}. ${ou.organisation.name} (${ou.organisation.slug})`);
      console.log(`      OrgUser ID: ${ou.id}`);
      console.log(`      Email: ${ou.email}`);
    });
    console.log(`\n   💡 These should have corresponding memberships. If not, run a sync script.`);
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
