import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addOrgAdmin() {
    try {
        const orgSlug = 'testorgg';
        const globalUserId = 'cmh3kt6gv0000vr4kay34b56o'; // charlie@mckeonwebsolutions.com

        // Get org
        const org = await prisma.organisation.findFirst({
            where: { slug: orgSlug }
        });

        if (!org) {
            console.log(`❌ Organization "${orgSlug}" not found`);
            return;
        }

        // Get global user
        const globalUser = await prisma.globalUser.findUnique({
            where: { id: globalUserId }
        });

        if (!globalUser) {
            console.log(`❌ Global user not found`);
            return;
        }

        console.log(`Adding ${globalUser.email} as admin of ${org.name}...`);

        // Check if already exists
        const existing = await prisma.organisationAdmin.findFirst({
            where: {
                organisationId: org.id,
                globalUserId: globalUser.id
            }
        });

        if (existing) {
            console.log('✅ User is already an admin of this org');
            return;
        }

        // Create the admin relationship
        await prisma.organisationAdmin.create({
            data: {
                organisationId: org.id,
                globalUserId: globalUser.id
            }
        });

        console.log('✅ Successfully added user as org admin!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addOrgAdmin();
