import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrgs() {
    try {
        const orgs = await prisma.organisation.findMany();

        console.log('\n=== Organizations in Database ===');
        console.log(`Total count: ${orgs.length}\n`);

        if (orgs.length === 0) {
            console.log('❌ No organizations found!');
        } else {
            orgs.forEach((org, index) => {
                console.log(`${index + 1}. ${org.name}`);
                console.log(`   Slug: ${org.slug}`);
                console.log(`   ID: ${org.id}`);
                console.log(`   Created: ${org.createdAt}`);
                console.log('');
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrgs();
