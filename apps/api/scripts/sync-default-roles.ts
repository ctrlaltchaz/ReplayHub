import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { PermissionService } from '../src/modules/rbac/services/permission.service';
import { RoleService } from '../src/modules/rbac/services/role.service';

async function bootstrap() {
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
    }
  }

  const [, , slug] = process.argv;

  if (!slug) {
    console.error('Usage: ts-node scripts/sync-default-roles.ts <org-slug>');
    process.exit(1);
    return;
  }

  const appContext = await NestFactory.createApplicationContext(AppModule, { logger: false });

  try {
    const prisma = appContext.get(PrismaService);
    const permissionService = appContext.get(PermissionService);
    const roleService = appContext.get(RoleService);

    const organisation = await prisma.organisation.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!organisation) {
      throw new Error(`Organisation with slug "${slug}" not found`);
    }

    const permissionsResult = await permissionService.seedDefaultPermissions(organisation.id);
    console.log(
      `Seeded default permissions for ${organisation.name} (${organisation.id})`,
      permissionsResult
    );

    const result = await roleService.seedDefaultRoles(organisation.id);
    console.log(`Synced default roles for ${organisation.name} (${organisation.id})`, result);
  } catch (error) {
    console.error('Failed to sync default roles:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch(error => {
  console.error('Unexpected error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
