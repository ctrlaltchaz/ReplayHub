const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
    console.log('🗑️  Starting database cleanup (keeping your user)...\n');

    try {
        // Get your user info first
        const users = await prisma.globalUser.findMany();
        console.log('Found users:', users.map(u => `${u.email} (${u.id})`));

        if (users.length === 0) {
            console.log('No users found!');
            return;
        }

        // Pick the user to keep
        const keepUser = users[0];
        console.log(`\n✓ Keeping user: ${keepUser.email} (${keepUser.id})\n`);

        // Disable foreign key checks temporarily and truncate all tenant-scoped tables
        console.log('Disabling foreign key checks...');
        await prisma.$executeRawUnsafe('SET session_replication_role = replica;');

        // List of all tenant-scoped tables to truncate
        const tables = [
            'attendances', 'incidents', 'bookings', 'resources', 'events',
            'player_stats', 'map_games', 'matches', 'asset_versions', 'assets',
            'inventory_movements', 'inventory_kit_items', 'inventory_kits', 'inventory_items',
            'checklist_runs', 'checklists', 'checklist_templates',
            'runsheet_template_items', 'runsheet_templates', 'runsheet_items', 'runsheets',
            'achievements', 'lineup_slots', 'lineups', 'availabilities',
            'team_members', 'players', 'teams', 'audit_logs', 'notes',
            'org_invites', 'role_permissions', 'org_user_roles', 'org_users',
            'roles', 'permissions', 'organisation_admins', 'organisations'
        ];

        console.log('Truncating tables...');
        for (const table of tables) {
            try {
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
                console.log(`  ✓ ${table}`);
            } catch (err) {
                console.log(`  ⚠️  ${table} - ${err.message}`);
            }
        }

        // Re-enable foreign key checks
        console.log('\nRe-enabling foreign key checks...');
        await prisma.$executeRawUnsafe('SET session_replication_role = DEFAULT;');

        // Delete all global users except the one to keep
        console.log('\nDeleting other global users...');
        const deleted = await prisma.globalUser.deleteMany({
            where: {
                id: { not: keepUser.id }
            }
        });
        console.log(`Deleted ${deleted.count} users`);

        console.log('\n✅ Database cleaned! Only your user remains.\n');
        console.log('You can now:');
        console.log('1. Log in with your existing credentials');
        console.log('2. Create a fresh organization');
        console.log('3. Start clean with no orphaned data\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase().catch(console.error);
