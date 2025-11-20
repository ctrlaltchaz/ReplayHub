import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import 'reflect-metadata';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { GlobalOrganisationsService } from '../src/modules/global-organisations/global-organisations.service';

async function bootstrap() {
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.join(__dirname, '..', envFile);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
    }
  }

  const appContext = await NestFactory.createApplicationContext(AppModule, { logger: false });

  try {
    const prisma = appContext.get(PrismaService);
    const service = appContext.get(GlobalOrganisationsService);

    const owner = await prisma.globalUser.findFirst({
      where: { isGlobalAdmin: true },
    });

    if (!owner) {
      throw new Error('No global admin user found to own the organisation');
    }

    const timestamp = Date.now().toString(36);
    const slug = `autotest-${timestamp}`;
    const name = `Auto Test ${timestamp}`;

    const org = await service.create({ name, slug }, owner.id);

    console.log('Created organisation:', org);
  } catch (error) {
    console.error(
      'Failed to create organisation via service:',
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  } finally {
    await appContext.close();
  }
}

bootstrap().catch(error => {
  console.error('Unexpected error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
