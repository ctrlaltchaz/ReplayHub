/**
 * Debug Login Test
 * Tests the login logic directly to see where it fails
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('\n=== DEBUG LOGIN TEST ===\n');

    const email = 'charlie@mckeonwebsolutions.com';
    const password = 'RosieTed123!';

    try {
        console.log('1. Looking for global user...');
        const globalUser = await prisma.globalUser.findUnique({
            where: { email },
            include: {
                organisationAdmins: {
                    include: {
                        organisation: true,
                    },
                },
            },
        });

        if (!globalUser) {
            console.log('   ❌ Global user not found');
            return;
        }

        console.log('   ✓ Found:', globalUser.email);
        console.log('   - isGlobalAdmin:', globalUser.isGlobalAdmin);
        console.log('   - isActive:', globalUser.isActive);
        console.log('   - isTotpEnabled:', globalUser.isTotpEnabled);

        console.log('\n2. Checking password...');
        const isValid = await bcrypt.compare(password, globalUser.passwordHash);
        console.log('   Password valid:', isValid ? '✓' : '❌');

        console.log('\n3. Checking organisations...');
        console.log('   Organisation admins:', globalUser.organisationAdmins.length);

        if (globalUser.organisationAdmins.length > 0) {
            globalUser.organisationAdmins.forEach(oa => {
                console.log(`   - ${oa.organisation.name} (${oa.organisation.slug})`);
            });
        }

        console.log('\n4. Looking for org users with same email...');
        const orgUsers = await prisma.orgUser.findMany({
            where: { email },
        });
        console.log('   Org users found:', orgUsers.length);

        if (orgUsers.length > 0) {
            const tenantIds = [...new Set(orgUsers.map(ou => ou.tenantId))];
            console.log('   Tenant IDs:', tenantIds);

            console.log('\n5. Fetching organisations for org users...');
            const orgs = await prisma.organisation.findMany({
                where: {
                    id: {
                        in: tenantIds,
                    },
                },
                select: {
                    id: true,
                    slug: true,
                    name: true,
                },
            });

            console.log('   Organisations:', orgs.length);
            orgs.forEach(org => {
                console.log(`   - ${org.name} (${org.slug})`);
            });
        }

        console.log('\n✅ Login test completed successfully!');
        console.log('\nIf you see this, the database queries work fine.');
        console.log('The 500 error might be from session handling or response formatting.');

    } catch (error) {
        console.error('\n❌ Error during login test:');
        console.error('   Message:', error.message);
        console.error('   Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
