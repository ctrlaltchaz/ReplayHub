import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const globalUsers = await prisma.globalUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isGlobalAdmin: true,
    },
    take: 20,
  });

  console.log('\n=== Global Users ===\n');
  globalUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.name || user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Global Admin: ${user.isGlobalAdmin}`);
    console.log('');
  });

  const orgs = await prisma.organisation.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    take: 10,
  });

  console.log('\n=== Organizations ===\n');
  orgs.forEach((org, idx) => {
    console.log(`${idx + 1}. ${org.name}`);
    console.log(`   ID: ${org.id}`);
    console.log(`   Slug: ${org.slug}`);
    console.log('');
  });
}

main()
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
