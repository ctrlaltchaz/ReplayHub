const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        const email = 'charlie@mckeonwebsolutions.com';
        const password = 'RosieTed123!';

        // Check if user already exists
        const existing = await prisma.globalUser.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('✅ User already exists. Updating password...');
            const passwordHash = await bcrypt.hash(password, 10);

            await prisma.globalUser.update({
                where: { id: existing.id },
                data: {
                    passwordHash,
                    isActive: true,
                    isGlobalAdmin: true
                }
            });

            console.log('✅ Password updated successfully!');
            console.log('   Email:', email);
            console.log('   Password:', password);
            return;
        }

        // Create new user
        console.log('Creating new admin user...');
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.globalUser.create({
            data: {
                email,
                passwordHash,
                isGlobalAdmin: true,
                isActive: true,
                name: 'Charlie Admin',
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('   ID:', user.id);
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   isGlobalAdmin:', user.isGlobalAdmin);
        console.log('\n🚀 You can now login at: http://localhost:3000/login');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
