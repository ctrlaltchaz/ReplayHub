import path from 'path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_PERMISSION_DEFINITIONS } from '../src/modules/rbac/permission-definitions';

config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

interface SeedResult {
  slug: string;
  name: string;
  created: number;
  updated: number;
  unchanged: number;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options: { slug?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      options.slug = args[i + 1];
      i++;
    }
  }

  return options;
}

async function seedPermissionsForTenant(
  tenantId: string,
  slug: string,
  name: string
): Promise<SeedResult> {
  console.log(`\n🏢 Seeding permissions for ${name} (${slug})`);

  await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const definition of DEFAULT_PERMISSION_DEFINITIONS) {
    const existing = await prisma.permission.findUnique({
      where: {
        tenantId_key: {
          tenantId,
          key: definition.key,
        },
      },
    });

    if (existing) {
      if (existing.group !== definition.group || existing.desc !== definition.description) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            group: definition.group,
            desc: definition.description,
          },
        });
        updated++;
      } else {
        unchanged++;
      }
      continue;
    }

    await prisma.permission.create({
      data: {
        tenantId,
        key: definition.key,
        group: definition.group,
        desc: definition.description,
      },
    });
    created++;
  }

  console.log(`   ➕ Created: ${created}`);
  console.log(`   ♻️  Updated: ${updated}`);
  console.log(`   👍 Unchanged: ${unchanged}`);

  return { slug, name, created, updated, unchanged };
}

async function main() {
  const { slug } = parseArgs();

  const tenants = await prisma.organisation.findMany({
    where: slug ? { slug } : undefined,
    orderBy: { createdAt: 'asc' },
  });

  if (tenants.length === 0) {
    console.log(
      slug ? `❌ Organisation with slug "${slug}" not found.` : '❌ No organisations found.'
    );
    process.exit(1);
  }

  console.log(
    `🚀 Seeding ${DEFAULT_PERMISSION_DEFINITIONS.length} permission definitions for ${tenants.length} organisation(s).`
  );

  const results: SeedResult[] = [];
  for (const tenant of tenants) {
    const result = await seedPermissionsForTenant(tenant.id, tenant.slug, tenant.name);
    results.push(result);
  }

  console.log('\n📊 Summary');
  results.forEach(result => {
    console.log(
      ` - ${result.name} (${result.slug}): ${result.created} created, ${result.updated} updated, ${result.unchanged} already up-to-date`
    );
  });

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('\n✅ Permission seeding complete.');
  })
  .catch(async error => {
    console.error('\n❌ Permission seeding failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
