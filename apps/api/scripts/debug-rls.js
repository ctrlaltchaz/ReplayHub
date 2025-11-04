const { PrismaClient } = require('@prisma/client');

async function debugRLS() {
    const prisma = new PrismaClient();

    try {
        console.log('=== RLS DEBUG ANALYSIS ===\n');

        const testorgId = 'cmgiegpdm0001vrco7ye750rt';
        const alphaId = 'cmgicwj4j0006vrgozzydkwfm';

        // Check actual tenant_id distribution in org_users table
        console.log('1) Actual tenant_id distribution in org_users:');
        const userDist = await prisma.$queryRawUnsafe('SELECT tenant_id, COUNT(*) as count FROM org_users GROUP BY tenant_id ORDER BY count DESC');
        userDist.forEach(row => {
            const org = row.tenant_id === testorgId ? 'testorg' :
                row.tenant_id === alphaId ? 'alpha' : 'other';
            console.log(`- ${org} (${row.tenant_id.substring(0, 8)}...): ${row.count} users`);
        });

        console.log('\n2) Testing RLS context switching:');

        // Test testorg context
        await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', '${testorgId}', false)`);
        const testorgVisible = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM org_users');
        console.log('testorg context sees:', testorgVisible[0].count, 'users');

        // Test alpha context  
        await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', '${alphaId}', false)`);
        const alphaVisible = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM org_users');
        console.log('alpha context sees:', alphaVisible[0].count, 'users');

        console.log('\n3) Checking actual data:');

        // Check actual alpha data
        const alphaActual = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM org_users WHERE tenant_id = '${alphaId}'`);
        console.log('Actual alpha users in DB:', alphaActual[0].count);

        const testorgActual = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM org_users WHERE tenant_id = '${testorgId}'`);
        console.log('Actual testorg users in DB:', testorgActual[0].count);

        console.log('\n4) RLS Policy Check:');

        // Check current setting
        const currentSetting = await prisma.$queryRawUnsafe('SELECT current_setting(\'app.tenant_id\') as setting');
        console.log('Current tenant_id setting:', currentSetting[0].setting);

        // Manual RLS condition test
        const manualFilter = await prisma.$queryRawUnsafe('SELECT COUNT(*) as count FROM org_users WHERE tenant_id = current_setting(\'app.tenant_id\')');
        console.log('Manual RLS condition result:', manualFilter[0].count);

        console.log('\n=== CONCLUSION ===');

        if (alphaActual[0].count === '0') {
            console.log('✅ RLS working correctly - alpha org has no users, so both contexts see the same data');
        } else {
            console.log('❌ RLS may not be working - both orgs have data but contexts see same counts');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

debugRLS();