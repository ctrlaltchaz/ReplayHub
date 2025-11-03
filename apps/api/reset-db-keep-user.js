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

        // Assuming you want to keep the first/main user
        const keepUser = users[0];
        console.log(`\n✓ Keeping user: ${keepUser.email} (${keepUser.id})\n`);

        // Delete in order to respect foreign key constraints
        console.log('Deleting LineupSlots...');
        await prisma.lineupSlot.deleteMany({});

        console.log('Deleting Lineups...');
        await prisma.lineup.deleteMany({});

        console.log('Deleting Availabilities...');
        await prisma.availability.deleteMany({});

        console.log('Deleting TeamMembers...');
        await prisma.teamMember.deleteMany({});

        console.log('Deleting Achievements...');
        await prisma.achievement.deleteMany({});

        console.log('Deleting Players...');
        await prisma.player.deleteMany({});

        console.log('Deleting Teams...');
        await prisma.team.deleteMany({});

        console.log('Deleting RunsheetItems...');
        await prisma.runsheetItem.deleteMany({});

        console.log('Deleting Runsheets...');
        await prisma.runsheet.deleteMany({});

        console.log('Deleting RunsheetTemplates...');
        await prisma.runsheetTemplate.deleteMany({});

        console.log('Deleting Notes...');
        await prisma.note.deleteMany({});

        console.log('Deleting Events...');
        await prisma.event.deleteMany({});

        console.log('Deleting OrgInvites...');
        await prisma.orgInvite.deleteMany({});

        console.log('Deleting RolePermissions...');
        await prisma.rolePermission.deleteMany({});

        console.log('Deleting OrgUserRoles...');
        await prisma.orgUserRole.deleteMany({});

        console.log('Deleting OrgUsers...');
        await prisma.orgUser.deleteMany({});

        console.log('Deleting Roles...');
        await prisma.role.deleteMany({});

        console.log('Deleting Permissions...');
        await prisma.permission.deleteMany({});

        console.log('Deleting AuditLogs...');
        await prisma.auditLog.deleteMany({});

        console.log('Deleting OrganisationAdmins...');
        await prisma.organisationAdmin.deleteMany({});

        console.log('Deleting Organisations...');
        await prisma.organisation.deleteMany({});

        console.log('Deleting other GlobalUsers...');
        await prisma.globalUser.deleteMany({
            where: {
                id: { not: keepUser.id }
            }
        });

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
