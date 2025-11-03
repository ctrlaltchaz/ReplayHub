const { PrismaClient } = require('@prisma/client');

async function debugRLSWithTransaction() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public'
            }
        }
    });

    console.log('🔍 Debugging RLS with Transaction\n');

    try {
        // Get all unique tenant IDs first
        const allUsers = await prisma.orgUser.findMany({
            select: { email: true, tenantId: true }
        });

        console.log('All users in database:');
        allUsers.forEach(user => {
            console.log(`  - ${user.email} (tenant: "${user.tenantId}")`);
        });

        const uniqueTenants = [...new Set(allUsers.map(u => u.tenantId))];
        console.log(`\nUnique tenants: ${uniqueTenants.map(t => `"${t}"`).join(', ')}\n`);

        // Test RLS for each tenant
        for (const tenantId of uniqueTenants) {
            console.log(`Testing RLS for tenant: "${tenantId}"`);

            const result = await prisma.$transaction(async (tx) => {
                // Set the tenant context
                await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

                // Verify the setting
                const configCheck = await tx.$queryRaw`SELECT current_setting('app.tenant_id', true) as tenant_id`;
                console.log(`  ✓ Config set to: "${configCheck[0].tenant_id}"`);

                // Test the RLS condition manually
                const conditionTest = await tx.$queryRaw`
                    SELECT 
                        tenant_id,
                        current_setting('app.tenant_id', true) as config_value,
                        (tenant_id = current_setting('app.tenant_id'::text, true)) as condition_result
                    FROM org_users 
                    WHERE tenant_id = ${tenantId}
                    LIMIT 1
                `;

                if (conditionTest.length > 0) {
                    const test = conditionTest[0];
                    console.log(`  ✓ Condition test: tenant_id="${test.tenant_id}" = config="${test.config_value}" → ${test.condition_result}`);
                }

                // Get users through Prisma (should be filtered by RLS)
                const users = await tx.orgUser.findMany({
                    select: { email: true, tenantId: true }
                });

                return users;
            });

            console.log(`  → RLS returned ${result.length} users:`);
            result.forEach(user => {
                const correct = user.tenantId === tenantId;
                console.log(`    ${correct ? '✅' : '❌'} ${user.email} (tenant: "${user.tenantId}")`);
            });
            console.log();
        }

        console.log('✅ RLS debugging complete!');

    } catch (error) {
        console.error('❌ Failed to debug RLS:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

debugRLSWithTransaction();