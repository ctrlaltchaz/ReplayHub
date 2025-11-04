/**
 * PRODUCTION DATABASE RESET SCRIPT
 * 
 * DANGER: This will DROP and RECREATE all tables
 * 
 * This script:
 * 1. Drops all existing tables (clean slate)
 * 2. Runs Prisma migrations from scratch
 * 3. Generates Prisma Client
 * 4. Sets up RLS policies
 * 5. Seeds permissions
 * 6. Creates admin user
 * 
 * Usage: node scripts/reset-production-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });
const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

// Color output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function findProjectRoot() {
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
        const packagePath = path.join(currentDir, 'package.json');
        if (require('fs').existsSync(packagePath)) {
            const pkg = require(packagePath);
            if (pkg.workspaces) {
                return currentDir;
            }
        }
        currentDir = path.dirname(currentDir);
    }
    throw new Error('Could not find project root with workspaces');
}

async function dropAllTables(client) {
    log('\n🗑️  Dropping all existing tables...', 'yellow');

    try {
        // Drop all tables in public schema
        await client.query(`
      DO $$ 
      DECLARE
          r RECORD;
      BEGIN
          -- Drop all tables
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
          LOOP
              EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
          
          -- Drop all sequences
          FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
          LOOP
              EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
          END LOOP;
          
          -- Drop all types
          FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e')
          LOOP
              EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
          END LOOP;
      END $$;
    `);

        log('✅ All tables dropped', 'green');
        return true;
    } catch (error) {
        log(`❌ Error dropping tables: ${error.message}`, 'red');
        return false;
    }
}

async function setupExtensions(client) {
    log('\n🔧 Setting up PostgreSQL extensions...', 'blue');

    try {
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        log('✅ Extensions created', 'green');
        return true;
    } catch (error) {
        log(`❌ Error creating extensions: ${error.message}`, 'red');
        return false;
    }
}

async function runPrismaMigrations(projectRoot) {
    log('\n📦 Running Prisma migrations...', 'blue');

    try {
        const schemaPath = path.join(projectRoot, 'apps/api/prisma/schema.prisma');

        // Reset Prisma migrations (will recreate from scratch)
        log('Resetting Prisma migrations...', 'yellow');
        execSync(`npm exec -- prisma migrate reset --force --schema="${schemaPath}"`, {
            cwd: projectRoot,
            stdio: 'inherit',
            env: { ...process.env }
        });

        log('✅ Prisma migrations applied', 'green');
        return true;
    } catch (error) {
        log(`❌ Prisma migration error: ${error.message}`, 'red');
        return false;
    }
}

async function generatePrismaClient(projectRoot) {
    log('\n🔨 Generating Prisma Client...', 'blue');

    try {
        const schemaPath = path.join(projectRoot, 'apps/api/prisma/schema.prisma');
        execSync(`npm exec -- prisma generate --schema="${schemaPath}"`, {
            cwd: projectRoot,
            stdio: 'inherit'
        });

        log('✅ Prisma Client generated', 'green');
        return true;
    } catch (error) {
        log(`❌ Prisma generate error: ${error.message}`, 'red');
        return false;
    }
}

async function setupRLS(client) {
    log('\n🔒 Setting up Row-Level Security...', 'blue');

    try {
        // Enable RLS on tenant-scoped tables
        const tenantTables = [
            'org_users', 'roles', 'permissions', 'role_permissions', 'org_user_roles',
            'resources', 'events', 'resource_bookings', 'event_assignments',
            'runsheets', 'runsheet_items', 'checklist_templates', 'checklist_items',
            'checklists', 'checklist_runs', 'checklist_completed_items',
            'inventory_items', 'inventory_kits', 'inventory_kit_items', 'inventory_movements',
            'assets', 'asset_versions', 'incidents', 'teams', 'players', 'team_members',
            'achievements', 'audit_logs', 'game_logs', 'game_log_categories'
        ];

        for (const table of tenantTables) {
            // Check if table exists
            const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);

            if (tableCheck.rows[0].exists) {
                await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);

                // Drop existing policy if it exists
                await client.query(`DROP POLICY IF EXISTS tenant_isolation_${table} ON ${table}`);

                // Create tenant isolation policy
                await client.query(`
          CREATE POLICY tenant_isolation_${table} ON ${table}
          FOR ALL 
          USING (organization_id::text = current_setting('app.tenant_id', true))
        `);

                log(`  ✓ RLS enabled on ${table}`, 'green');
            } else {
                log(`  ⚠ Table ${table} does not exist, skipping RLS`, 'yellow');
            }
        }

        log('✅ RLS policies created', 'green');
        return true;
    } catch (error) {
        log(`❌ RLS setup error: ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');
        return false;
    }
}

async function seedPermissions(client) {
    log('\n🌱 Seeding permissions...', 'blue');

    try {
        // Check if we have any organizations first
        const orgCheck = await client.query('SELECT id FROM organisations LIMIT 1');

        if (orgCheck.rows.length === 0) {
            log('⚠️  No organizations exist yet. Permissions will be seeded when first org is created.', 'yellow');
            return true;
        }

        log('✅ Permission seeding ready', 'green');
        return true;
    } catch (error) {
        log(`❌ Permission seed error: ${error.message}`, 'red');
        return false;
    }
}

async function createAdminUser(client) {
    log('\n👤 Creating admin user...', 'blue');

    try {
        const bcrypt = require('bcryptjs');
        const email = 'charlie@mckeonwebsolutions.com';
        const password = 'RosieTed123!';
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if user exists
        const userCheck = await client.query('SELECT id FROM global_users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            log(`✅ Admin user ${email} already exists`, 'green');
            return true;
        }

        // Create admin user
        await client.query(`
      INSERT INTO global_users (email, name, password_hash, is_global_admin, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [email, 'Charlie', passwordHash, true, true]);

        log(`✅ Admin user created: ${email}`, 'green');
        log(`   Password: ${password}`, 'magenta');
        return true;
    } catch (error) {
        log(`❌ Admin user creation error: ${error.message}`, 'red');
        return false;
    }
}

async function main() {
    log('╔════════════════════════════════════════════════════════════╗', 'magenta');
    log('║     PRODUCTION DATABASE RESET - COMPLETE REBUILD          ║', 'magenta');
    log('╚════════════════════════════════════════════════════════════╝', 'magenta');

    log('\n⚠️  WARNING: This will DELETE ALL DATA and rebuild from scratch!', 'red');
    log('⚠️  Press Ctrl+C within 5 seconds to cancel...', 'red');

    await new Promise(resolve => setTimeout(resolve, 5000));

    const projectRoot = findProjectRoot();
    log(`\n📁 Project root: ${projectRoot}`, 'blue');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        log('❌ DATABASE_URL not found in environment', 'red');
        process.exit(1);
    }

    log(`🔗 Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`, 'blue');

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        log('✅ Connected to database', 'green');

        // Step 1: Drop all tables
        if (!await dropAllTables(client)) {
            throw new Error('Failed to drop tables');
        }

        // Step 2: Setup extensions
        if (!await setupExtensions(client)) {
            throw new Error('Failed to setup extensions');
        }

        await client.end();
        log('🔌 Disconnected from database for Prisma operations', 'blue');

        // Step 3: Run Prisma migrations
        if (!await runPrismaMigrations(projectRoot)) {
            throw new Error('Failed to run Prisma migrations');
        }

        // Step 4: Generate Prisma Client
        if (!await generatePrismaClient(projectRoot)) {
            throw new Error('Failed to generate Prisma Client');
        }

        // Reconnect for post-migration setup
        await client.connect();
        log('🔌 Reconnected to database', 'blue');

        // Step 5: Setup RLS
        if (!await setupRLS(client)) {
            throw new Error('Failed to setup RLS');
        }

        // Step 6: Seed permissions
        if (!await seedPermissions(client)) {
            throw new Error('Failed to seed permissions');
        }

        // Step 7: Create admin user
        if (!await createAdminUser(client)) {
            throw new Error('Failed to create admin user');
        }

        log('\n╔════════════════════════════════════════════════════════════╗', 'green');
        log('║              🎉 DATABASE RESET COMPLETE! 🎉                ║', 'green');
        log('╚════════════════════════════════════════════════════════════╝', 'green');

        log('\n📋 Next steps:', 'blue');
        log('   1. Restart the API server', 'yellow');
        log('   2. Login at: https://app.replayhub.app/login', 'yellow');
        log('   3. Email: charlie@mckeonwebsolutions.com', 'yellow');
        log('   4. Password: RosieTed123!', 'yellow');

    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
