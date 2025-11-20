import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { OrganisationProvisioningService } from '../src/modules/global-organisations/organisation-provisioning.service';

async function bootstrap() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error(
      'Usage: npx ts-node -r tsconfig-paths/register scripts/provision-organisation.ts <org-slug|org-id>'
    );
    process.exit(1);
  }

  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
    }
  }

  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const prisma = appContext.get(PrismaService);
  const provisioning = appContext.get(OrganisationProvisioningService);

  try {
    const organisation = await prisma.organisation.findFirst({
      where: identifier.startsWith('cm') ? { id: identifier } : { slug: identifier },
    });

    if (!organisation) {
      throw new Error(`Organisation "${identifier}" not found.`);
    }

    if (!organisation.ownerId) {
      throw new Error(
        `Organisation ${organisation.id} (${organisation.slug}) does not have an owner.`
      );
    }

    console.log(
      `Provisioning organisation ${organisation.slug} (${organisation.id}) for owner ${organisation.ownerId}...`
    );
    await provisioning.provisionNewOrganisation(organisation.id, organisation.ownerId);
    console.log('Provisioning complete.');
  } catch (error) {
    console.error('Provisioning failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch(error => {
  console.error(
    'Unexpected error while provisioning organisation:',
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});
