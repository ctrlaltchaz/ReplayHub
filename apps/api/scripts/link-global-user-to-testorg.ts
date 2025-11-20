import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkGlobalUserToTestOrg() {
  try {
    console.log('🔗 Linking global user to testorg...');

    // Find the global user
    const globalUser = await prisma.globalUser.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!globalUser) {
      console.log('❌ Global user admin@example.com not found');
      return;
    }

    console.log('✅ Found global user:', globalUser.email);

    // Create the organization
    const organization = await prisma.organisation.upsert({
      where: { slug: 'testorg' },
      update: {},
      create: {
        name: 'Test Organization',
        slug: 'testorg',
        ownerId: globalUser.id,
        branding: {},
        features: {},
      },
    });

    console.log('✅ Created/found organization:', organization.name);

    // Make the global user an admin of the organization
    await prisma.organisationAdmin.upsert({
      where: {
        organisationId_globalUserId: {
          organisationId: organization.id,
          globalUserId: globalUser.id,
        },
      },
      update: {},
      create: {
        organisationId: organization.id,
        globalUserId: globalUser.id,
      },
    });

    console.log('✅ Linked global user as organization admin');
    console.log('\n🎉 Setup complete!');
    console.log('Global user admin@example.com can now access testorg');
    console.log(
      'You can now test org endpoints at: http://localhost:3001/api/org/testorg/auth/login'
    );
  } catch (error) {
    console.error('❌ Error linking user to org:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

linkGlobalUserToTestOrg();
