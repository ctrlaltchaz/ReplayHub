import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserName() {
  try {
    const email = 'charlie@mckeonwebsolutions.com';

    // Check current user
    const user = await prisma.globalUser.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log('\n=== Current User ===');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || '(not set)'}`);
    console.log(`ID: ${user.id}`);

    // Update with name if not set
    if (!user.name) {
      const updated = await prisma.globalUser.update({
        where: { email },
        data: { name: 'Charlie McKeon' },
      });

      console.log('\n✅ Updated user with name: Charlie McKeon');
    } else {
      console.log('\n✅ User already has a name set');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserName();
