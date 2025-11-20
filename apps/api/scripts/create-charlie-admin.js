const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createGlobalAdmin() {
  try {
    console.log('👤 Creating Global Admin Account...\n');

    const email = 'charlie@mckeonwebsolutions.com';
    const password = 'Admin123!'; // CHANGE THIS AFTER FIRST LOGIN
    const name = 'Charlie McKeon';

    // Check if user already exists
    let globalUser = await prisma.globalUser.findFirst({
      where: { email },
    });

    if (globalUser) {
      console.log('⚠️  User already exists with email:', email);
      console.log('   User ID:', globalUser.id);
      console.log('\n✅ Ensuring global admin role...');
    } else {
      // Create new global user
      const hashedPassword = await bcrypt.hash(password, 10);

      globalUser = await prisma.globalUser.create({
        data: {
          email,
          passwordHash: hashedPassword,
          isGlobalAdmin: true,
          isActive: true,
        },
      });

      console.log('✅ Global Admin User Created!');
      console.log('   Email:', email);
      console.log('   Name:', name);
      console.log('   Password:', password);
      console.log('   PLEASE CHANGE PASSWORD AFTER FIRST LOGIN!\n');
    }

    // Ensure user is global admin
    await prisma.globalUser.update({
      where: { id: globalUser.id },
      data: {
        isGlobalAdmin: true,
        isActive: true,
      },
    });

    // Link to all existing organizations as admin
    const orgs = await prisma.organisation.findMany();

    console.log(`🏢 Linking to ${orgs.length} organization(s)...\n`);

    for (const org of orgs) {
      // Check if already linked
      const existing = await prisma.organisationAdmin.findFirst({
        where: {
          organisationId: org.id,
          globalUserId: globalUser.id,
        },
      });

      if (!existing) {
        await prisma.organisationAdmin.create({
          data: {
            organisationId: org.id,
            globalUserId: globalUser.id,
          },
        });
        console.log(`   ✅ Linked to: ${org.name} (${org.slug})`);
      } else {
        console.log(`   ℹ️  Already linked to: ${org.name} (${org.slug})`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 GLOBAL ADMIN ACCOUNT READY!\n');
    console.log('📧 Email:    ', email);
    console.log('🔑 Password: ', password);
    console.log('👤 Name:     ', name);
    console.log('🌐 Super Admin: YES');
    console.log('🏢 Organizations:', orgs.length);
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
    console.log('🔗 Login at: http://localhost:3000\n');

    if (orgs.length > 0) {
      console.log('📋 Available Organizations:');
      orgs.forEach(org => {
        console.log(`   • ${org.name} → http://localhost:3000/org/${org.slug}`);
      });
      console.log('\n🎛️  Admin Control Center: http://localhost:3000/admin/control-center\n');
    }
  } catch (error) {
    console.error('❌ Error creating global admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createGlobalAdmin();
