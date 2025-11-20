const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function main() {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await prisma.globalUser.update({
      where: { email: 'charlie@mckeonwebsolutions.com' },
      data: { passwordHash },
    });
    console.log('✅ Reset Charlie admin password to Admin123!');
  } catch (error) {
    console.error('❌ Failed to reset password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
