import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGlobalUserOrgAccess() {
    try {
        // Find all global users
        const globalUsers = await prisma.globalUser.findMany({
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        console.log('\n=== Global Users ===');
        globalUsers.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.name || 'N/A'}`);
            console.log('---');
        });

        // Find testorganisation
        const testOrg = await prisma.organisation.findFirst({
            where: {
                slug: 'testorganisation'
            },
            select: {
                id: true,
                name: true,
                slug: true,
            }
        });

        if (!testOrg) {
            console.log('\n❌ testorganisation not found!');
            return;
        }

        console.log('\n=== Test Organisation ===');
        console.log(`ID: ${testOrg.id}`);
        console.log(`Name: ${testOrg.name}`);
        console.log(`Slug: ${testOrg.slug}`);

        // Check for linked org users
        console.log('\n=== Checking Org User Links ===');
        for (const globalUser of globalUsers) {
            const orgUser = await prisma.orgUser.findFirst({
                where: {
                    globalUserId: globalUser.id,
                    tenantId: testOrg.id,
                },
                include: {
                    roles: {
                        include: {
                            role: {
                                include: {
                                    permissions: {
                                        include: {
                                            permission: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (orgUser) {
                console.log(`\n✅ ${globalUser.email} IS linked to testorganisation`);
                console.log(`   OrgUser ID: ${orgUser.id}`);
                console.log(`   Display Name: ${orgUser.displayName}`);
                console.log(`   Roles: ${orgUser.roles.map(r => r.role.name).join(', ')}`);
                const perms = orgUser.roles.flatMap(r => r.role.permissions.map(p => p.permission.key));
                console.log(`   Permissions: ${perms.length} total`);
                if (perms.length > 0 && perms.length <= 10) {
                    console.log(`   - ${perms.join('\n   - ')}`);
                } else if (perms.length > 10) {
                    console.log(`   - ${perms.slice(0, 5).join('\n   - ')}`);
                    console.log(`   ... and ${perms.length - 5} more`);
                }
            } else {
                console.log(`\n❌ ${globalUser.email} is NOT linked to testorganisation`);
            }
        }

        // Check for organisation admins
        console.log('\n=== Checking Organisation Admins ===');
        const orgAdmins = await prisma.organisationAdmin.findMany({
            where: {
                organisationId: testOrg.id
            },
            include: {
                globalUser: true
            }
        });

        if (orgAdmins.length === 0) {
            console.log('❌ No organisation admins found');
        } else {
            orgAdmins.forEach(admin => {
                console.log(`✅ ${admin.globalUser.email} is an org admin (role: ${admin.role})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkGlobalUserOrgAccess();
