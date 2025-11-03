const { PrismaClient } = require('@prisma/client');

async function debugRLSPolicy() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public'
            }
        }
    });

    console.log('🔍 Debugging RLS Policy\n');

    try {
        const alphaOrgId = 'cmgsly5m60007vr0wgfr4y0p3';

        // Set tenant context
        console.log(`Setting tenant context to: ${alphaOrgId}`);
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${alphaOrgId}, true)`;

        // Check what the setting returns
        const configResult = await prisma.$queryRaw`SELECT current_setting('app.tenant_id', true) as tenant_id`;
        const configValue = configResult[0].tenant_id;
        console.log(`Config setting returns: "${configValue}" (type: ${typeof configValue})`);

        // Manually test the condition
        const manualTest = await prisma.$queryRaw`
            SELECT 
                tenant_id,
                tenant_id::text as tenant_id_text,
                current_setting('app.tenant_id', true) as config_value,
                (tenant_id::text = current_setting('app.tenant_id', true)) as condition_result
            FROM org_users 
            LIMIT 5
        `;

        console.log('\nManual condition test:');
        manualTest.forEach(row => {
            console.log(`  tenant_id: "${row.tenant_id}" | config: "${row.config_value}" | match: ${row.condition_result}`);
        });

        // Try querying with RLS (should be filtered)
        console.log('\nQuerying with RLS (should only show Alpha users):');
        const users = await prisma.orgUser.findMany({
            select: { email: true, tenantId: true }
        });

        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`  - ${user.email} (tenant: ${user.tenantId})`);
        });

        console.log('\n✅ RLS Policy debug complete!');

    } catch (error) {
        console.error('❌ Failed to debug RLS policy:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

debugRLSPolicy();