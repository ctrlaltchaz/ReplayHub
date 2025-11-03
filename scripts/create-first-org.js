/**
 * Create First Organization Script
 * 
 * Creates an initial organization for testing/setup
 * 
 * Usage: node scripts/create-first-org.js <org-name> <org-slug>
 * Example: node scripts/create-first-org.js "My Esports Org" my-org
 */

require('dotenv').config({ path: require('path').join(__dirname, '../apps/api/.env') });
const { Client } = require('pg');

function createId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 24;
  let id = 'cm';
  for (let i = 0; i < length; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

async function main() {
  const orgName = process.argv[2] || 'ReplayHub Esports';
  const orgSlug = process.argv[3] || 'replayhub';
  
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║     CREATE FIRST ORGANIZATION                      ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  console.log(`Organization Name: ${orgName}`);
  console.log(`Organization Slug: ${orgSlug}\n`);
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }
  
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Find the global admin user
    const adminResult = await client.query(
      'SELECT id, email, name FROM global_users WHERE is_global_admin = true LIMIT 1'
    );
    
    if (adminResult.rows.length === 0) {
      console.error('❌ No global admin user found');
      console.log('   Run: node scripts/create-admin-verbose.js first');
      process.exit(1);
    }
    
    const admin = adminResult.rows[0];
    console.log(`📋 Found admin: ${admin.email} (${admin.name})`);
    
    // Check if org already exists
    const orgCheck = await client.query(
      'SELECT id, name, slug FROM organisations WHERE slug = $1',
      [orgSlug]
    );
    
    if (orgCheck.rows.length > 0) {
      console.log(`\n⚠️  Organization "${orgSlug}" already exists!`);
      console.log(`   ID: ${orgCheck.rows[0].id}`);
      console.log(`   Name: ${orgCheck.rows[0].name}`);
      process.exit(0);
    }
    
    // Create the organization
    const orgId = createId();
    await client.query(`
      INSERT INTO organisations (id, name, slug, owner_id, branding, features, quick_links_json, created_at, updated_at)
      VALUES ($1, $2, $3, $4, '{}', '{}', '[]', NOW(), NOW())
    `, [orgId, orgName, orgSlug, admin.id]);
    
    console.log(`\n✅ Created organization: ${orgName}`);
    console.log(`   ID: ${orgId}`);
    console.log(`   Slug: ${orgSlug}`);
    console.log(`   Owner: ${admin.email}`);
    
    // Create organisation_admin record
    await client.query(`
      INSERT INTO organisation_admins (id, organisation_id, global_user_id, role, created_at)
      VALUES ($1, $2, $3, 'owner', NOW())
    `, [createId(), orgId, admin.id]);
    
    console.log(`\n✅ Added ${admin.email} as organization owner`);
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              ✅ ORGANIZATION CREATED! ✅           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log('Next steps:');
    console.log('  1. Run: node scripts/fix-production-database.js');
    console.log('     (This will seed permissions and roles)');
    console.log('  2. Restart the API server');
    console.log(`  3. Login and switch to organization: ${orgSlug}\n`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
