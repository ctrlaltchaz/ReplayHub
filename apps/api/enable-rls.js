const { PrismaClient } = require('@prisma/client');

async function enableRLS() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'postgresql://postgres:postgres@localhost:5432/esports_ops?schema=public'
            }
        }
    });

    console.log('🔧 Enabling RLS (Row-Level Security)\n');

    try {
        // Enable RLS on org_users table
        console.log('Enabling RLS on org_users...');
        await prisma.$executeRaw`ALTER TABLE org_users ENABLE ROW LEVEL SECURITY`;
        console.log('  ✅ RLS enabled on org_users');

        // Enable RLS on roles table
        console.log('Enabling RLS on roles...');
        await prisma.$executeRaw`ALTER TABLE roles ENABLE ROW LEVEL SECURITY`;
        console.log('  ✅ RLS enabled on roles');

        // Verify RLS is now enabled
        console.log('\nVerifying RLS status...');
        const rlsStatus = await prisma.$queryRaw`
            SELECT tablename, rowsecurity
            FROM pg_tables 
            WHERE tablename IN ('org_users', 'roles')
        `;

        console.log('RLS Status after enabling:', rlsStatus);

        console.log('\n✅ RLS enabled successfully!');

    } catch (error) {
        console.error('❌ Failed to enable RLS:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

enableRLS();