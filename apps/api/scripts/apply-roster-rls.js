const { PrismaClient } = require('@prisma/client');

async function applyRLSPolicies() {
    const prisma = new PrismaClient();

    try {
        console.log('Applying RLS policies for roster tables...');

        // Enable RLS on all roster tables
        const tables = ['teams', 'players', 'team_members', 'availability', 'lineups', 'lineup_slots', 'achievements'];

        for (const table of tables) {
            console.log(`Enabling RLS for ${table}...`);
            await prisma.$executeRawUnsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
            await prisma.$executeRawUnsafe(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);

            // Create tenant policy
            await prisma.$executeRawUnsafe(`
        CREATE POLICY ${table}_tenant_policy ON ${table}
          FOR ALL
          USING (tenant_id = current_setting('app.tenant_id'))
      `);
        }

        console.log('✅ RLS policies applied successfully!');
    } catch (error) {
        console.error('❌ Error applying RLS policies:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

applyRLSPolicies();