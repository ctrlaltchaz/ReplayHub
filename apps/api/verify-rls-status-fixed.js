const { PrismaClient } = require('@prisma/client');

async function verifyRLSStatusFixed() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public'
            }
        }
    });

    console.log('🔍 Verifying RLS Status\n');

    try {
        // Check table RLS status using pg_class
        console.log('1. Checking table RLS status:');
        const rlsStatus = await prisma.$queryRaw`
            SELECT 
                n.nspname as schema_name,
                c.relname as table_name,
                c.relrowsecurity as rls_enabled,
                c.relforcerowsecurity as rls_forced
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'org_users' AND n.nspname = 'public'
        `;

        if (rlsStatus.length > 0) {
            const status = rlsStatus[0];
            console.log(`   ✓ Table: ${status.table_name}`);
            console.log(`   ✓ RLS Enabled: ${status.rls_enabled}`);
            console.log(`   ✓ RLS Forced: ${status.rls_forced}`);
        } else {
            console.log('   ❌ Table not found');
        }

        // Check existing policies
        console.log('\n2. Checking existing policies:');
        const policies = await prisma.$queryRaw`
            SELECT 
                schemaname,
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual
            FROM pg_policies
            WHERE tablename = 'org_users'
        `;

        console.log(`   Found ${policies.length} policies:`);
        policies.forEach((policy, i) => {
            console.log(`   ${i + 1}. ${policy.policyname}`);
            console.log(`      - Command: ${policy.cmd}`);
            console.log(`      - Condition: ${policy.qual}`);
            console.log(`      - Applies to roles: ${policy.roles ? policy.roles.join(', ') : 'ALL'}`);
        });

        // Check current user/role
        console.log('\n3. Checking current database connection:');
        const currentUser = await prisma.$queryRaw`SELECT current_user, session_user, current_database()`;
        console.log(`   Current user: ${currentUser[0].current_user}`);
        console.log(`   Session user: ${currentUser[0].session_user}`);
        console.log(`   Database: ${currentUser[0].current_database}`);

        // Test RLS with direct SQL vs Prisma
        console.log('\n4. Testing RLS enforcement:');
        const tenantId = 'test-org-1';

        await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Verify config is set
            const config = await tx.$queryRaw`SELECT current_setting('app.tenant_id', true) as tenant_id`;
            console.log(`   ✓ Tenant context set to: "${config[0].tenant_id}"`);

            console.log('\n   Direct SQL query:');
            const directSQL = await tx.$queryRaw`SELECT email, tenant_id FROM org_users ORDER BY email`;
            console.log(`   → Returned ${directSQL.length} users`);
            directSQL.forEach(user => {
                const match = user.tenant_id === tenantId;
                console.log(`     ${match ? '✅' : '❌'} ${user.email} (tenant: ${user.tenant_id})`);
            });

            console.log('\n   Prisma ORM query:');
            const prismaQuery = await tx.orgUser.findMany({
                select: { email: true, tenantId: true },
                orderBy: { email: 'asc' }
            });
            console.log(`   → Returned ${prismaQuery.length} users`);
            prismaQuery.forEach(user => {
                const match = user.tenantId === tenantId;
                console.log(`     ${match ? '✅' : '❌'} ${user.email} (tenant: ${user.tenantId})`);
            });
        });

        console.log('\n✅ RLS status verification complete!');

    } catch (error) {
        console.error('❌ Failed to verify RLS status:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRLSStatusFixed();