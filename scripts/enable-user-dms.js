const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enableUserDMs() {
    try {
        const result = await prisma.$executeRaw`
      UPDATE organization_discord 
      SET enable_user_dms = true 
      WHERE tenant_id IS NOT NULL
    `;

        console.log('✅ User DMs enabled for all organizations');
        console.log(`   Updated ${result} record(s)`);

        // Verify
        const configs = await prisma.organizationDiscord.findMany({
            select: {
                tenantId: true,
                guildName: true,
                enableUserDMs: true,
                enableEventNotifications: true,
            }
        });

        console.log('\n📋 Current Discord configs:');
        configs.forEach(c => {
            console.log(`   ${c.guildName || c.tenantId}: DMs=${c.enableUserDMs}, Events=${c.enableEventNotifications}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

enableUserDMs();
