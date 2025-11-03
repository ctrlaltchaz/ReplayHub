const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOrphanedOrgUsers() {
    console.log('Finding all OrgUser records...\n');

    const allOrgUsers = await prisma.orgUser.findMany();
    console.log(`Total OrgUser records: ${allOrgUsers.length}\n`);

    const orphaned = [];
    const valid = [];

    for (const ou of allOrgUsers) {
        const org = await prisma.organisation.findUnique({
            where: { id: ou.tenantId }
        });

        if (org) {
            valid.push({ orgUser: ou, org });
        } else {
            orphaned.push(ou);
        }
    }

    console.log(`✓ ${valid.length} valid OrgUser records`);
    valid.forEach(({ orgUser, org }) => {
        console.log(`  - ${orgUser.id} -> ${org.name}`);
    });

    console.log(`\n✗ ${orphaned.length} orphaned OrgUser records (no matching organisation)`);
    orphaned.forEach(ou => {
        console.log(`  - ${ou.id} (tenantId: ${ou.tenantId})`);
    });

    if (orphaned.length > 0) {
        console.log('\n🗑️  Deleting orphaned records...');
        const result = await prisma.orgUser.deleteMany({
            where: {
                id: { in: orphaned.map(ou => ou.id) }
            }
        });
        console.log(`✓ Deleted ${result.count} orphaned OrgUser records\n`);
    } else {
        console.log('\n✓ No orphaned records to clean up!\n');
    }

    await prisma.$disconnect();
}

cleanupOrphanedOrgUsers().catch(console.error);
