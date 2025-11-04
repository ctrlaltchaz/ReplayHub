/**
 * Comprehensive Permission Seeder
 * 
 * Seeds all permissions for all organizations dynamically
 * This replaces all those manual .sql scripts with hardcoded tenant IDs
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });
const { Client } = require('pg');
const { createId } = require('@paralleldrive/cuid2');

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
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
        { key: 'feedback.submit', description: 'Submit bug reports and suggestions to platform admins' },
        { key: 'feedback.view', description: 'View feedback submissions' },
        { key: 'feedback.manage', description: 'Manage feedback (respond, update status)' },
    ],
    org: [
        { key: 'org.settings.view', description: 'View organization settings' },
        { key: 'org.settings.manage', description: 'Manage organization settings' },
    ],
    users: [
        { key: 'users.view', description: 'View users' },
        { key: 'users.invite', description: 'Invite users' },
        { key: 'users.manage', description: 'Manage users (edit roles, deactivate)' },
    ],
    roles: [
        { key: 'roles.view', description: 'View roles' },
        { key: 'roles.manage', description: 'Manage roles and permissions' },
    ],
};

// Default roles with their permissions
const DEFAULT_ROLES = {
    'Admin': {
        description: 'Full administrative access',
        permissions: 'ALL', // Special marker for all permissions
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
            'events.view',
            'resources.view',
            'runsheet.view',
            'incidents.view', 'incidents.create',
            'inventory.view',
            'assets.view',
            'reports.view',
            'roster.view',
            'feedback.submit',
        ],
    },
};

async function seedPermissionsForOrg(client, orgId, orgName) {
    log(`\n📋 Seeding permissions for: ${orgName}`, 'blue');

    const permissionIds = {};

    // Insert all permissions
    for (const [group, permissions] of Object.entries(PERMISSION_GROUPS)) {
        for (const perm of permissions) {
            try {
                const result = await client.query(`
          INSERT INTO permissions (id, tenant_id, key, "group", description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (tenant_id, key) DO UPDATE 
          SET description = EXCLUDED.description, updated_at = NOW()
          RETURNING id
        `, [createId(), orgId, perm.key, group, perm.description]);

                permissionIds[perm.key] = result.rows[0].id;
                log(`  ✓ ${perm.key}`, 'green');
            } catch (error) {
                log(`  ✗ ${perm.key}: ${error.message}`, 'red');
            }
        }
    }

    return permissionIds;
}

async function seedRolesForOrg(client, orgId, orgName, permissionIds) {
    log(`\n👥 Seeding roles for: ${orgName}`, 'blue');

    const roleIds = {};

    // Get all permission IDs for this org
    const allPermissionIdsResult = await client.query(`
    SELECT id FROM permissions WHERE tenant_id = $1
  `, [orgId]);
    const allPermissionIds = allPermissionIdsResult.rows.map(r => r.id);

    for (const [roleName, roleConfig] of Object.entries(DEFAULT_ROLES)) {
        try {
            // Insert or update role
            const roleResult = await client.query(`
        INSERT INTO roles (id, tenant_id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (tenant_id, name) DO UPDATE
        SET description = EXCLUDED.description, updated_at = NOW()
        RETURNING id
      `, [createId(), orgId, roleName, roleConfig.description]);

            const roleId = roleResult.rows[0].id;
            roleIds[roleName] = roleId;
            log(`  ✓ Role: ${roleName}`, 'green');

            // Determine which permissions to assign
            let permissionsToAssign = [];
            if (roleConfig.permissions === 'ALL') {
                permissionsToAssign = allPermissionIds;
            } else {
                permissionsToAssign = roleConfig.permissions
                    .map(key => permissionIds[key])
                    .filter(id => id !== undefined);
            }

            // Assign permissions to role
            for (const permId of permissionsToAssign) {
                try {
                    await client.query(`
            INSERT INTO role_permissions (id, tenant_id, role_id, permission_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [createId(), orgId, roleId, permId]);
                } catch (error) {
                    // Ignore conflicts
                }
            }

            log(`    → Assigned ${permissionsToAssign.length} permissions`, 'yellow');

        } catch (error) {
            log(`  ✗ Role ${roleName}: ${error.message}`, 'red');
        }
    }

    return roleIds;
}

async function assignAdminRoleToOrgUser(client, orgId, roleIds) {
    log(`\n🔗 Assigning Admin role to org users...`, 'blue');

    try {
        // Find all org users for this organization
        const usersResult = await client.query(`
      SELECT id, email FROM org_users WHERE tenant_id = $1
    `, [orgId]);

        if (usersResult.rows.length === 0) {
            log('  ⚠️  No org users found', 'yellow');
            return;
        }

        const adminRoleId = roleIds['Admin'];
        if (!adminRoleId) {
            log('  ⚠️  Admin role not found', 'yellow');
            return;
        }

        for (const user of usersResult.rows) {
            try {
                await client.query(`
          INSERT INTO org_user_roles (id, tenant_id, org_user_id, role_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (org_user_id, role_id) DO NOTHING
        `, [createId(), orgId, user.id, adminRoleId]);

                log(`  ✓ ${user.email} → Admin`, 'green');
            } catch (error) {
                log(`  ✗ ${user.email}: ${error.message}`, 'red');
            }
        }
    } catch (error) {
        log(`  ✗ Error: ${error.message}`, 'red');
    }
}

async function main() {
    log('╔══════════════════════════════════════════════════════════╗', 'magenta');
    log('║         COMPREHENSIVE PERMISSION SEEDER                  ║', 'magenta');
    log('╚══════════════════════════════════════════════════════════╝', 'magenta');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        log('❌ DATABASE_URL not found', 'red');
        process.exit(1);
    }

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        log('✅ Connected to database\n', 'green');

        // Get all organizations
        const orgsResult = await client.query(`
      SELECT id, slug, name FROM organisations WHERE is_active = true ORDER BY created_at
    `);

        if (orgsResult.rows.length === 0) {
            log('⚠️  No organizations found. Permissions will be seeded when orgs are created.', 'yellow');
            process.exit(0);
        }

        log(`📊 Found ${orgsResult.rows.length} organization(s)\n`, 'blue');

        // Seed permissions and roles for each org
        for (const org of orgsResult.rows) {
            const permissionIds = await seedPermissionsForOrg(client, org.id, org.name);
            const roleIds = await seedRolesForOrg(client, org.id, org.name, permissionIds);
            await assignAdminRoleToOrgUser(client, org.id, roleIds);
        }

        log('\n╔══════════════════════════════════════════════════════════╗', 'green');
        log('║              ✅ SEEDING COMPLETE! ✅                     ║', 'green');
        log('╚══════════════════════════════════════════════════════════╝', 'green');

        // Summary
        log('\n📊 Summary:', 'blue');
        for (const org of orgsResult.rows) {
            const permCount = await client.query('SELECT COUNT(*) FROM permissions WHERE tenant_id = $1', [org.id]);
            const roleCount = await client.query('SELECT COUNT(*) FROM roles WHERE tenant_id = $1', [org.id]);
            log(`  ${org.name}:`, 'yellow');
            log(`    - ${permCount.rows[0].count} permissions`, 'reset');
            log(`    - ${roleCount.rows[0].count} roles`, 'reset');
        }

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
