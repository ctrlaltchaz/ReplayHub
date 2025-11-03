/**
 * Production Database Fix Script
 * 
 * Run this on the server to fix missing permissions and roles
 * 
 * Usage: node scripts/fix-production-database.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });
const { Client } = require('pg');

// Simple CUID2 generator (inline to avoid dependencies)
function createId() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 24;
    let id = 'cm'; // prefix
    for (let i = 0; i < length; i++) {
        id += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return id;
}

// Complete permission definitions
const PERMISSION_GROUPS = {
    events: [
        { key: 'events.view', description: 'View events' },
        { key: 'events.create', description: 'Create events' },
        { key: 'events.manage', description: 'Full event management (create, edit, delete)' },
    ],
    resources: [
        { key: 'resources.view', description: 'View resources' },
        { key: 'resources.manage', description: 'Manage resources' },
    ],
    runsheet: [
        { key: 'runsheet.view', description: 'View runsheets' },
        { key: 'runsheet.edit', description: 'Create and edit runsheets' },
        { key: 'runsheet.approve', description: 'Approve runsheets' },
        { key: 'runsheet.lock', description: 'Lock runsheets' },
    ],
    incidents: [
        { key: 'incidents.view', description: 'View incidents' },
        { key: 'incidents.create', description: 'Create incidents' },
        { key: 'incidents.manage', description: 'Manage incidents (update, delete, assign, RCA)' },
    ],
    inventory: [
        { key: 'inventory.view', description: 'View inventory items' },
        { key: 'inventory.update', description: 'Update inventory items' },
        { key: 'inventory.book', description: 'Book inventory items' },
    ],
    assets: [
        { key: 'assets.view', description: 'View assets' },
        { key: 'assets.upload', description: 'Upload assets' },
        { key: 'assets.manage', description: 'Manage assets' },
        { key: 'assets.approve', description: 'Approve assets' },
    ],
    reports: [
        { key: 'reports.view', description: 'View reports' },
        { key: 'reports.export', description: 'Export reports' },
    ],
    roster: [
        { key: 'roster.view', description: 'View roster' },
        { key: 'roster.manage', description: 'Manage roster (players, teams)' },
    ],
    feedback: [
        { key: 'feedback.submit', description: 'Submit bug reports and suggestions' },
        { key: 'feedback.view', description: 'View feedback submissions' },
        { key: 'feedback.manage', description: 'Manage feedback' },
    ],
    org: [
        { key: 'org.settings.view', description: 'View organization settings' },
        { key: 'org.settings.manage', description: 'Manage organization settings' },
    ],
    users: [
        { key: 'users.view', description: 'View users' },
        { key: 'users.invite', description: 'Invite users' },
        { key: 'users.manage', description: 'Manage users' },
    ],
    roles: [
        { key: 'roles.view', description: 'View roles' },
        { key: 'roles.manage', description: 'Manage roles and permissions' },
    ],
};

// Default roles
const DEFAULT_ROLES = {
    'Admin': {
        description: 'Full administrative access',
        permissions: 'ALL',
    },
    'Manager': {
        description: 'Manager with operational access',
        permissions: [
            'events.view', 'events.create', 'events.manage',
            'resources.view', 'resources.manage',
            'runsheet.view', 'runsheet.edit', 'runsheet.approve',
            'incidents.view', 'incidents.create', 'incidents.manage',
            'inventory.view', 'inventory.update', 'inventory.book',
            'assets.view', 'assets.upload', 'assets.manage',
            'reports.view', 'reports.export',
            'roster.view', 'roster.manage',
            'users.view', 'users.invite',
        ],
    },
    'Member': {
        description: 'Basic member access',
        permissions: [
            'events.view', 'resources.view', 'runsheet.view',
            'incidents.view', 'incidents.create',
            'inventory.view', 'assets.view', 'reports.view',
            'roster.view', 'feedback.submit',
        ],
    },
};

async function checkDatabase(client) {
    console.log('\n=== CHECKING DATABASE STATE ===\n');

    // Check organizations
    const orgs = await client.query('SELECT id, slug, name FROM organisations ORDER BY created_at');
    console.log(`✓ Found ${orgs.rows.length} organization(s)`);

    if (orgs.rows.length === 0) {
        console.log('⚠️  No organizations found. Create an organization first.');
        return null;
    }

    for (const org of orgs.rows) {
        console.log(`  - ${org.name} (${org.slug})`);

        const permCount = await client.query('SELECT COUNT(*) FROM permissions WHERE tenant_id = $1', [org.id]);
        const roleCount = await client.query('SELECT COUNT(*) FROM roles WHERE tenant_id = $1', [org.id]);
        const userCount = await client.query('SELECT COUNT(*) FROM org_users WHERE tenant_id = $1', [org.id]);

        console.log(`    Permissions: ${permCount.rows[0].count}`);
        console.log(`    Roles: ${roleCount.rows[0].count}`);
        console.log(`    Users: ${userCount.rows[0].count}`);
    }

    return orgs.rows;
}

async function seedPermissionsForOrg(client, orgId, orgName) {
    console.log(`\n=== SEEDING PERMISSIONS FOR: ${orgName} ===\n`);

    const permissionIds = {};
    let added = 0;
    let updated = 0;

    for (const [group, permissions] of Object.entries(PERMISSION_GROUPS)) {
        for (const perm of permissions) {
            const check = await client.query(
                'SELECT id FROM permissions WHERE tenant_id = $1 AND key = $2',
                [orgId, perm.key]
            );

            if (check.rows.length > 0) {
                permissionIds[perm.key] = check.rows[0].id;
                updated++;
            } else {
                const result = await client.query(`
          INSERT INTO permissions (id, tenant_id, key, "group", description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id
        `, [createId(), orgId, perm.key, group, perm.description]);

                permissionIds[perm.key] = result.rows[0].id;
                console.log(`  ✓ Added: ${perm.key}`);
                added++;
            }
        }
    }

    console.log(`\n  Summary: ${added} added, ${updated} existing`);
    return permissionIds;
}

async function seedRolesForOrg(client, orgId, orgName, permissionIds) {
    console.log(`\n=== SEEDING ROLES FOR: ${orgName} ===\n`);

    const roleIds = {};

    // Get all permission IDs for this org
    const allPermsResult = await client.query('SELECT id FROM permissions WHERE tenant_id = $1', [orgId]);
    const allPermissionIds = allPermsResult.rows.map(r => r.id);

    for (const [roleName, roleConfig] of Object.entries(DEFAULT_ROLES)) {
        // Check if role exists
        const roleCheck = await client.query(
            'SELECT id FROM roles WHERE tenant_id = $1 AND name = $2',
            [orgId, roleName]
        );

        let roleId;
        if (roleCheck.rows.length > 0) {
            roleId = roleCheck.rows[0].id;
            console.log(`  ✓ Role exists: ${roleName}`);
        } else {
            const result = await client.query(`
        INSERT INTO roles (id, tenant_id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id
      `, [createId(), orgId, roleName, roleConfig.description]);

            roleId = result.rows[0].id;
            console.log(`  ✓ Created role: ${roleName}`);
        }

        roleIds[roleName] = roleId;

        // Assign permissions
        let permissionsToAssign = [];
        if (roleConfig.permissions === 'ALL') {
            permissionsToAssign = allPermissionIds;
        } else {
            permissionsToAssign = roleConfig.permissions
                .map(key => permissionIds[key])
                .filter(id => id !== undefined);
        }

        let assigned = 0;
        for (const permId of permissionsToAssign) {
            const check = await client.query(
                'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
                [roleId, permId]
            );

            if (check.rows.length === 0) {
                await client.query(`
          INSERT INTO role_permissions (id, tenant_id, role_id, permission_id)
          VALUES ($1, $2, $3, $4)
        `, [createId(), orgId, roleId, permId]);
                assigned++;
            }
        }

        console.log(`    → Assigned ${assigned} new permissions (${permissionsToAssign.length} total)`);
    }

    return roleIds;
}

async function assignAdminRoleToUsers(client, orgId, roleIds) {
    console.log(`\n=== ASSIGNING ADMIN ROLE TO USERS ===\n`);

    const adminRoleId = roleIds['Admin'];
    if (!adminRoleId) {
        console.log('  ⚠️  Admin role not found');
        return;
    }

    const users = await client.query('SELECT id, email FROM org_users WHERE tenant_id = $1', [orgId]);

    if (users.rows.length === 0) {
        console.log('  ⚠️  No org users found');
        return;
    }

    for (const user of users.rows) {
        const check = await client.query(
            'SELECT id FROM org_user_roles WHERE org_user_id = $1 AND role_id = $2',
            [user.id, adminRoleId]
        );

        if (check.rows.length === 0) {
            await client.query(`
        INSERT INTO org_user_roles (id, tenant_id, org_user_id, role_id)
        VALUES ($1, $2, $3, $4)
      `, [createId(), orgId, user.id, adminRoleId]);

            console.log(`  ✓ Assigned Admin to: ${user.email}`);
        } else {
            console.log(`  - Already Admin: ${user.email}`);
        }
    }
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║     PRODUCTION DATABASE FIX SCRIPT                 ║');
    console.log('╚════════════════════════════════════════════════════╝');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found');
        process.exit(1);
    }

    console.log(`\n🔗 Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Check database state
        const orgs = await checkDatabase(client);
        if (!orgs || orgs.length === 0) {
            console.log('\n⚠️  No organizations to process. Exiting.');
            process.exit(0);
        }

        // Process each organization
        for (const org of orgs) {
            const permissionIds = await seedPermissionsForOrg(client, org.id, org.name);
            const roleIds = await seedRolesForOrg(client, org.id, org.name, permissionIds);
            await assignAdminRoleToUsers(client, org.id, roleIds);
        }

        console.log('\n╔════════════════════════════════════════════════════╗');
        console.log('║              ✅ FIX COMPLETE! ✅                   ║');
        console.log('╚════════════════════════════════════════════════════╝\n');

        console.log('Next steps:');
        console.log('  1. Restart the API server');
        console.log('  2. Test login and permissions\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
