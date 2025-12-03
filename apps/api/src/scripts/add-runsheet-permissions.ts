import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function addRunsheetPermissions() {
    console.log('🔧 Adding runsheet permissions...\n');

    try {
        // Get all organisations
        const orgs = await prisma.organisation.findMany();
        console.log(`📋 Found ${orgs.length} organisations\n`);

        for (const org of orgs) {
            console.log(`Processing org: ${org.name} (${org.id})`);

            // Add runsheet permissions
            const permissions = [
                { key: 'runsheet.view', group: 'runsheet', desc: 'View runsheets' },
                { key: 'runsheet.edit', group: 'runsheet', desc: 'Create and edit runsheets' },
                { key: 'runsheet.approve', group: 'runsheet', desc: 'Approve runsheets' },
                { key: 'runsheet.lock', group: 'runsheet', desc: 'Lock runsheets' },
            ];

            for (const perm of permissions) {
                try {
                    await prisma.permission.upsert({
                        where: {
                            tenantId_key: {
                                tenantId: org.id,
                                key: perm.key,
                            }
                        },
                        update: {},
                        create: {
                            tenantId: org.id,
                            key: perm.key,
                            group: perm.group,
                            desc: perm.desc,
                        }
                    });
                    console.log(`  ✓ Added permission: ${perm.key}`);
                } catch (err) {
                    console.log(`  ℹ Permission already exists: ${perm.key}`);
                }
            }

            // Find Admin role
            const adminRole = await prisma.role.findFirst({
                where: {
                    tenantId: org.id,
                    name: 'Admin'
                }
            });

            if (adminRole) {
                // Get all runsheet permissions for this org
                const runsheetPerms = await prisma.permission.findMany({
                    where: {
                        tenantId: org.id,
                        group: 'runsheet'
                    }
                });

                // Grant permissions to Admin role
                for (const perm of runsheetPerms) {
                    try {
                        await prisma.rolePermission.create({
                            data: {
                                tenantId: org.id,
                                roleId: adminRole.id,
                                permissionId: perm.id,
                            }
                        });
                        console.log(`  ✓ Granted ${perm.key} to Admin role`);
                    } catch (err) {
                        // Already exists
                    }
                }
            }

            console.log(`  ✅ Completed for ${org.name}\n`);
        }

        console.log('✅ Runsheet permissions setup complete!');
        console.log('🔄 Please refresh your browser to see the changes.\n');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

addRunsheetPermissions();
