const { PrismaClient } = require('@prisma/client');

async function debugOrgUser() {
    const prisma = new PrismaClient();

    try {
        // Check our specific user from the session
        const orgUserId = "cmgjtz0dn003svr7s3e2f76b5";
        const tenantId = "test-org-1";

        console.log(`Looking for orgUser: id=${orgUserId}, tenantId=${tenantId}`);

        const orgUser = await prisma.orgUser.findFirst({
            where: {
                id: orgUserId,
                tenantId: tenantId,
                isActive: true
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
            console.log('✅ FOUND orgUser:', {
                id: orgUser.id,
                email: orgUser.email,
                tenantId: orgUser.tenantId,
                isActive: orgUser.isActive,
                roleCount: orgUser.roles.length
            });
        } else {
            console.log('❌ NOT FOUND - orgUser is null');

            // Check if user exists with different tenantId
            const anyUser = await prisma.orgUser.findFirst({
                where: { id: orgUserId }
            });

            if (anyUser) {
                console.log('Found user with different tenantId:', {
                    id: anyUser.id,
                    email: anyUser.email,
                    tenantId: anyUser.tenantId,
                    isActive: anyUser.isActive
                });
            } else {
                console.log('User does not exist at all');
            }
        }

        // Also check tenant
        const tenant = await prisma.tenant.findFirst({
            where: { slug: 'testorg' }
        });

        console.log('Tenant info:', tenant);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugOrgUser();