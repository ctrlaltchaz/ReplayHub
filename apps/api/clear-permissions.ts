import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT_ID = 'cmh5exllt0002vr80jvywmnbv';

async function clearAndReseedPermissions() {
    try {
        console.log('Setting tenant context...');
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${TENANT_ID}, true)`;

        console.log('Deleting existing permissions...');
        const result = await prisma.permission.deleteMany({
            where: { tenantId: TENANT_ID }
        });

        console.log(`✅ Deleted ${result.count} permissions`);
        console.log('Now refresh the roles page and permissions will be auto-seeded!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearAndReseedPermissions();
