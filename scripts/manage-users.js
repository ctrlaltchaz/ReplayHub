const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

async function listAllUsers() {
    console.log('\n=== ALL USERS IN DATABASE ===\n');

    const globalUsers = await prisma.globalUser.findMany({
        include: {
            orgUsers: {
                include: {
                    roles: {
                        include: {
                            role: true
                        }
                    }
                }
            },
            organisations: {
                select: {
                    name: true,
                    slug: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (globalUsers.length === 0) {
        console.log('No users found in database.\n');
        return [];
    }

    globalUsers.forEach((user, index) => {
        console.log(`[${index + 1}] ${user.email}`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Name: ${user.name || 'N/A'}`);
        console.log(`    Global Admin: ${user.isGlobalAdmin ? 'Yes' : 'No'}`);
        console.log(`    Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`    Created: ${formatDate(user.createdAt)}`);
        console.log(`    Last Login: ${user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}`);

        if (user.organisations.length > 0) {
            console.log(`    Owns Organizations: ${user.organisations.map(o => o.name).join(', ')}`);
        }

        if (user.orgUsers.length > 0) {
            console.log(`    Organization Memberships:`);
            user.orgUsers.forEach(orgUser => {
                const roles = orgUser.roles.map(r => r.role.name).join(', ');
                console.log(`      - ${orgUser.displayName} (${roles || 'No roles'})`);
            });
        } else {
            console.log(`    Organization Memberships: None`);
        }

        console.log('');
    });

    return globalUsers;
}

async function deleteUserCompletely(userId, email) {
    console.log(`\n⚠️  WARNING: This will permanently delete ALL data for ${email}`);
    console.log('   - Global user account');
    console.log('   - All organization memberships (OrgUser records)');
    console.log('   - All user roles');
    console.log('   - All audit logs');
    console.log('   - Any owned organizations');
    console.log('   - All related data\n');

    const confirm = await question('Type "DELETE" to confirm permanent deletion: ');

    if (confirm !== 'DELETE') {
        console.log('❌ Deletion cancelled.\n');
        return false;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Get all org users for this global user
            const orgUsers = await tx.orgUser.findMany({
                where: { globalUserId: userId }
            });

            // Delete org user roles for each org user
            for (const orgUser of orgUsers) {
                await tx.orgUserRole.deleteMany({
                    where: { orgUserId: orgUser.id }
                });
            }

            // Delete all org users
            await tx.orgUser.deleteMany({
                where: { globalUserId: userId }
            });

            // Delete audit logs
            await tx.auditLog.deleteMany({
                where: { userId }
            });

            // Delete organization admin records
            await tx.organisationAdmin.deleteMany({
                where: { globalUserId: userId }
            });

            // Check if user owns any organizations
            const ownedOrgs = await tx.organisation.findMany({
                where: { ownerId: userId }
            });

            if (ownedOrgs.length > 0) {
                console.log(`\n   Note: User owns ${ownedOrgs.length} organization(s):`);
                ownedOrgs.forEach(org => {
                    console.log(`      - ${org.name} (${org.slug})`);
                });

                const deleteOrgs = await question('\n   Delete owned organizations too? (yes/no): ');

                if (deleteOrgs.toLowerCase() === 'yes') {
                    for (const org of ownedOrgs) {
                        // Delete all org-related data
                        await tx.orgUserRole.deleteMany({ where: { tenantId: org.id } });
                        await tx.orgUser.deleteMany({ where: { tenantId: org.id } });
                        await tx.orgInvite.deleteMany({ where: { tenantId: org.id } });
                        await tx.auditLog.deleteMany({ where: { tenantId: org.id } });
                        await tx.organisationAdmin.deleteMany({ where: { organisationId: org.id } });

                        // Delete the organization
                        await tx.organisation.delete({ where: { id: org.id } });
                    }
                    console.log('   ✓ Organizations deleted');
                } else {
                    console.log('   ⚠️  Cannot delete user - they own organizations. Transfer ownership first.');
                    throw new Error('User owns organizations');
                }
            }

            // Finally, delete the global user
            await tx.globalUser.delete({
                where: { id: userId }
            });
        });

        console.log(`\n✅ User ${email} and all related data permanently deleted.\n`);
        return true;
    } catch (error) {
        console.error(`\n❌ Error deleting user: ${error.message}\n`);
        return false;
    }
}

async function main() {
    console.clear();
    console.log('╔════════════════════════════════════════╗');
    console.log('║   USER MANAGEMENT SCRIPT               ║');
    console.log('╚════════════════════════════════════════╝\n');

    while (true) {
        const users = await listAllUsers();

        if (users.length === 0) {
            break;
        }

        console.log('Options:');
        console.log('  [1-' + users.length + '] - Select user to manage');
        console.log('  [r] - Refresh list');
        console.log('  [q] - Quit\n');

        const choice = await question('Enter your choice: ');

        if (choice.toLowerCase() === 'q') {
            break;
        }

        if (choice.toLowerCase() === 'r') {
            console.clear();
            continue;
        }

        const userIndex = parseInt(choice) - 1;
        if (userIndex >= 0 && userIndex < users.length) {
            const user = users[userIndex];

            console.log(`\n=== MANAGING: ${user.email} ===\n`);
            console.log('[1] Delete user permanently');
            console.log('[2] View details');
            console.log('[3] Back to list\n');

            const action = await question('Choose action: ');

            if (action === '1') {
                const deleted = await deleteUserCompletely(user.id, user.email);
                if (deleted) {
                    await question('Press Enter to continue...');
                }
            } else if (action === '2') {
                // Details already shown in the list
                await question('\nPress Enter to continue...');
            }

            console.clear();
        } else {
            console.log('\n❌ Invalid selection\n');
        }
    }

    console.log('\nGoodbye!\n');
    rl.close();
    await prisma.$disconnect();
}

main()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
