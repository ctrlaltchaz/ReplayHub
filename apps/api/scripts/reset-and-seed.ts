import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Create a new global admin user
 * Organizations can be created via the web interface
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/reset-and-seed.ts
 */
async function main() {
  console.log('\n🚀 Creating admin user...\n');

  try {
    // Step 1: Create admin global user
    console.log('👤 Creating admin global user...');

    const adminEmail = 'charlie@mckeonwebsolutions.com';
    const adminPassword = 'admin123'; // Change this after first login!
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Check if user already exists
    const existingUser = await prisma.globalUser.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log(`   ⚠️  User already exists: ${existingUser.email}`);
      console.log(`   Updating password...\n`);

      await prisma.globalUser.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          isGlobalAdmin: true,
        },
      });

      console.log(`   ✅ User updated: ${existingUser.email} (ID: ${existingUser.id})`);
      console.log(`   🔑 New Password: ${adminPassword}\n`);
    } else {
      const globalUser = await prisma.globalUser.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: 'Charlie Admin',
          isGlobalAdmin: true,
        },
      });

      console.log(`   ✅ Global user created: ${globalUser.email} (ID: ${globalUser.id})`);
      console.log(`   🔑 Password: ${adminPassword}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('✨ Admin user setup completed!');
    console.log('='.repeat(60));
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🌐 You can now:');
    console.log(`   1. Login at: POST /auth/login`);
    console.log(`   2. Create an organization via the web interface`);
    console.log(`   3. Access /admin/control-center as global admin`);
    console.log('\n⚠️  Remember to change the password after first login!\n');
  } catch (error) {
    console.error('\n❌ Error during reset and seed:', error);
    throw error;
  }
}

main()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
