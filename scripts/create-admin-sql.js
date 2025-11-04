#!/usr/bin/env node

const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdminUser() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        await client.connect();
        console.log('✓ Connected to database');

        const email = 'charlie@mckeonwebsolutions.com';
        const password = 'RosieTed123!';
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if user exists
        const existing = await client.query(
            'SELECT id FROM global_users WHERE email = $1',
            [email]
        );

        if (existing.rows.length > 0) {
            console.log('User exists, updating...');
            await client.query(
                'UPDATE global_users SET password_hash = $1, is_active = true, is_global_admin = true WHERE email = $2',
                [passwordHash, email]
            );
            console.log('✅ Password updated!');
        } else {
            console.log('Creating new user...');
            await client.query(
                'INSERT INTO global_users (id, email, password_hash, is_global_admin, is_active, name, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, true, true, $3, NOW(), NOW())',
                [email, passwordHash, 'Charlie Admin']
            );
            console.log('✅ User created!');
        }

        console.log('');
        console.log('Login credentials:');
        console.log('  Email:', email);
        console.log('  Password:', password);

        await client.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        await client.end();
        process.exit(1);
    }
}

createAdminUser();
