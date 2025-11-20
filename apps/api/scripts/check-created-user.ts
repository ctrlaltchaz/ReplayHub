// Check what was created in database after invite acceptance
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCreatedUser() {
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
    console.log(`🏢 Checking users in: ${testOrg.name} (${testOrg.id})\n`);

    // Find the newly created user
    const newUser = await prisma.orgUser.findFirst({
      where: {
        email: 'newviewer2@testorg.local',
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!newUser) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('=== CREATED USER DETAILS ===');
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`👤 Display Name: ${newUser.displayName}`);
    console.log(`⚡ Active: ${newUser.isActive}`);
    console.log(`🔐 Has Password: ${newUser.passwordHash ? 'Yes' : 'No'}`);
    console.log(`🕒 Created: ${newUser.createdAt}`);
    console.log(`🎭 Roles: ${newUser.roles.map(r => r.role.name).join(', ')}`);

    // Check if password hash starts with expected bcrypt prefix
    if (newUser.passwordHash) {
      const isBcrypt =
        newUser.passwordHash.startsWith('$2b$') || newUser.passwordHash.startsWith('$2a$');
      console.log(`🔑 Password Hash Format: ${isBcrypt ? 'bcrypt ✅' : 'Invalid ❌'}`);
      console.log(`🔑 Hash Length: ${newUser.passwordHash.length}`);
    }

    // Check all org users to see the pattern
    console.log('\n=== ALL ORG USERS ===');
    const allUsers = await prisma.orgUser.findMany({
      select: {
        email: true,
        isActive: true,
        passwordHash: true,
      },
    });

    allUsers.forEach(user => {
      const hasValidHash =
        user.passwordHash &&
        (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$'));
      console.log(`👤 ${user.email}: Active=${user.isActive}, ValidHash=${hasValidHash}`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCreatedUser();
