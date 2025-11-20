import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * DEPRECATED: Backfill script no longer needed - migration complete
 *
 * This script was used during Phase 2 of the user model migration to backfill
 * globalUserId references. All data has been migrated and the old OrgUser
 * relations have been removed from the schema.
 *
 * Kept for historical reference only.
 */
async function main() {
  console.log('⚠️  This script is deprecated - user model migration is complete');
  console.log('All globalUserId references have been backfilled.');
  console.log('No action taken.');
}

main()
  .catch(error => {
    console.error('Error during backfill:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
