import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function bootstrap() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error(
      'Usage: npx ts-node -r tsconfig-paths/register scripts/inspect-tenant.ts <org-slug|org-id>'
    );
    process.exit(1);
  }

  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const prisma = appContext.get(PrismaService);

  try {
    const organisation = await prisma.organisation.findFirst({
      where: identifier.startsWith('cm') ? { id: identifier } : { slug: identifier },
    });

    if (!organisation) {
      throw new Error(`Organisation "${identifier}" not found`);
    }

    const tenantId = organisation.id;
    console.log(`Inspecting tenant ${organisation.slug} (${tenantId})`);

    const [permissions, roles, orgUsers] = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const permissions = await tx.permission.findMany({
        where: { tenantId },
        select: { id: true, key: true, group: true },
        orderBy: { key: 'asc' },
      });

      const roles = await tx.role.findMany({
        where: { tenantId },
        include: {
          permissions: {
            include: {
              permission: {
                select: { id: true, key: true },
              },
            },
          },
          membershipRoles: {
            include: {
              membership: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const orgUsers = await tx.orgUser.findMany({
        where: { tenantId },
        include: {
          roles: {
            include: {
              role: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      return [permissions, roles, orgUsers] as const;
    });

    console.log(`Permissions (${permissions.length}):`);
    permissions.forEach(perm => {
      console.log(`  - ${perm.key} [${perm.group}] (${perm.id})`);
    });

    console.log(`\nRoles (${roles.length}):`);
    roles.forEach(role => {
      console.log(
        `  - ${role.name} (${role.id}) permissions=${role.permissions.length} users=${role.membershipRoles.length}`
      );
      role.permissions.forEach(rp => {
        console.log(`      * ${rp.permission.key}`);
      });
    });

    console.log(`\nOrg Users (${orgUsers.length}):`);
    orgUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.id}) global=${user.globalUserId}`);
      user.roles.forEach(ur => {
        console.log(`      * ${ur.role.name}`);
      });
    });
  } catch (error) {
    console.error('Inspection failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch(error => {
  console.error(
    'Unexpected error during inspection:',
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
