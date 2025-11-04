const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestOrganization() {
    try {
        console.log('🏗️ Creating test organization...');

        // Check if organization already exists
        const existing = await prisma.organisation.findFirst({
            where: { slug: 'testorg' }
        });

        if (existing) {
            console.log('✅ Organization "testorg" already exists');
            return existing;
        }

        // Create a global user first (organizations need an owner)
        const globalUserEmail = 'testorg@example.com';
        const password = 'TestPassword123!';
        const hashedPassword = await bcrypt.hash(password, 10);

        let globalUser = await prisma.globalUser.findFirst({
            where: { email: globalUserEmail }
        });

        if (!globalUser) {
            console.log('👤 Creating global user...');
            globalUser = await prisma.globalUser.create({
                data: {
                    email: globalUserEmail,
                    passwordHash: hashedPassword,
                }
            });
        }

        // Create the organization
        console.log('🏢 Creating organization...');
        const organisation = await prisma.organisation.create({
            data: {
                name: 'Test Organization',
                slug: 'testorg',
                ownerId: globalUser.id,
            }
        });

        // Create organization admin link
        await prisma.organisationAdmin.create({
            data: {
                organisationId: organisation.id,
                globalUserId: globalUser.id,
            }
        });

        console.log('✅ Test organization created successfully!');
        console.log('📋 Organization Details:');
        console.log(`   Name: ${organisation.name}`);
        console.log(`   Slug: ${organisation.slug}`);
        console.log(`   ID: ${organisation.id}`);
        console.log(`   Owner: ${globalUserEmail}`);

        return organisation;

    } catch (error) {
        console.error('❌ Error creating organization:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createTestOrganization();