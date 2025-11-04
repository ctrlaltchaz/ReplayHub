#!/usr/bin/env node

const path = require('path');
process.chdir(path.join(__dirname, '..', 'apps', 'api'));

console.log('Loading Prisma Client...');
const { PrismaClient } = require('@prisma/client');

console.log('Loading bcrypt...');
const bcrypt = require('bcrypt');

console.log('Creating Prisma instance...');
const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('Starting admin user creation...');
        const email = 'charlie@mckeonwebsolutions.com';
        const password = 'RosieTed123!';

        console.log('Checking for existing user...');
        const existing = await prisma.globalUser.findUnique({
            where: { email }
        });

        if (existing) {
            console.log('User exists, updating password...');
            const passwordHash = await bcrypt.hash(password, 10);

            await prisma.globalUser.update({
                where: { id: existing.id },
                data: {
                    passwordHash,
                    isActive: true,
                    isGlobalAdmin: true
                }
            });

            console.log('✅ Password updated!');
            console.log('   Email:', email);
            console.log('   Password:', password);
        } else {
            console.log('Creating new user...');
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

            console.log('✅ User created!');
            console.log('   ID:', user.id);
            console.log('   Email:', email);
            console.log('   Password:', password);
        }

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        await prisma.$disconnect();
        process.exit(1);
    }
}

createAdminUser();
