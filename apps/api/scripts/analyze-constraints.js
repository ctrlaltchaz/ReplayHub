const { PrismaClient } = require('@prisma/client');

async function analyzeConstraints() {
    const prisma = new PrismaClient();

    try {
        console.log('=== DEEP CONSTRAINT ANALYSIS ===\n');

        // Check Prisma implicit constraints
        const implicitConstraints = await prisma.$queryRawUnsafe(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        tc.constraint_type,
        pg_get_constraintdef(pgc.oid) as constraint_definition
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN pg_constraint pgc 
        ON tc.constraint_name = pgc.conname
      WHERE tc.table_name = 'org_users'
        AND tc.constraint_type = 'UNIQUE'
      ORDER BY tc.constraint_name;
    `);

        console.log('All UNIQUE constraints on org_users:');
        implicitConstraints.forEach(c => {
            console.log(`- ${c.constraint_name}: ${c.constraint_definition}`);
        });

        // Check Prisma-generated constraints
        console.log('\nPrisma @@unique constraints:');
        const prismaConstraints = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'org_users' 
        AND indexdef LIKE '%UNIQUE%'
        OR schemaname = 'public';
    `);

        prismaConstraints.forEach(c => {
            console.log(`- ${c.indexname}: ${c.indexdef}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeConstraints();