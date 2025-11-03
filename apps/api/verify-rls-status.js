const { PrismaClient } = require('@prisma/client');

async function verifyRLSStatus() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public'
            }
        }
    });

    console.log('🔍 Verifying RLS Status\n');

    try {
        // Check table RLS status
        console.log('1. Checking table RLS status:');
        const rlsStatus = await prisma.$queryRaw`
            SELECT 
                schemaname,
                tablename,
                rowsecurity,
                hasrls
            FROM pg_tables 
            WHERE tablename = 'org_users'
        `;

        console.log('   org_users table RLS status:', rlsStatus[0]);

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

        console.log('   Policies found:', policies.length);
        policies.forEach((policy, i) => {
            console.log(`   ${i + 1}. ${policy.policyname}`);
            console.log(`      - Command: ${policy.cmd}`);
            console.log(`      - Condition: ${policy.qual}`);
            console.log(`      - Roles: ${policy.roles}`);
        });

        // Check current user/role
        console.log('\n3. Checking current database role:');
        const currentUser = await prisma.$queryRaw`SELECT current_user, session_user`;
        console.log('   Current user:', currentUser[0]);

        // Test with direct SQL vs Prisma
        console.log('\n4. Testing direct SQL vs Prisma:');
        const tenantId = 'test-org-1';

        await prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Direct SQL query
            const directSQL = await tx.$queryRaw`SELECT email, tenant_id FROM org_users`;
            console.log(`   Direct SQL returned ${directSQL.length} users:`);
            directSQL.forEach(user => {
                const match = user.tenant_id === tenantId;
                console.log(`     ${match ? '✅' : '❌'} ${user.email} (${user.tenant_id})`);
            });

            // Prisma query
            const prismaQuery = await tx.orgUser.findMany({
                select: { email: true, tenantId: true }
            });
            console.log(`   Prisma query returned ${prismaQuery.length} users:`);
            prismaQuery.forEach(user => {
                const match = user.tenantId === tenantId;
                console.log(`     ${match ? '✅' : '❌'} ${user.email} (${user.tenantId})`);
            });
        });

        console.log('\n✅ RLS status verification complete!');

    } catch (error) {
        console.error('❌ Failed to verify RLS status:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyRLSStatus();