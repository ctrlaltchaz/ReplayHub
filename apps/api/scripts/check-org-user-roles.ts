/**
 * Quick audit script to list users and their roles per organisation and flag common issues.
 *
 * Run (from repo root):
 *   npx ts-node apps/api/scripts/check-org-user-roles.ts          # all orgs
 *   npx ts-node apps/api/scripts/check-org-user-roles.ts --org myorgslug
 *
 * Requires DATABASE_URL to be set (same as Nest API).
 */
import { PrismaClient } from '@prisma/client';

interface CliArgs {
  org?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--org' || arg === '-o') {
      parsed.org = args[i + 1];
      i++;
    }
  }

  return parsed;
}

void (async () => {
  const prisma = new PrismaClient();
  const { org } = parseArgs();

  try {
    const orgs = org
      ? await prisma.organisation.findMany({ where: { slug: org } })
      : await prisma.organisation.findMany();

    if (!orgs.length) {
      console.error(org ? `No organisation found for slug "${org}"` : 'No organisations found');
      process.exit(1);
    }

    for (const organisation of orgs) {
      console.log(`\n=== ${organisation.name} (${organisation.slug}) ===`);

      // Fetch memberships + roles
      const memberships = await prisma.userOrganisationMembership.findMany({
        where: { tenantId: organisation.id },
        include: {
          roles: { include: { role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Fetch org users + roles
      const orgUsers = await prisma.orgUser.findMany({
        where: { tenantId: organisation.id },
        include: {
          roles: { include: { role: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const membershipByGlobalUserId = new Map<string, (typeof memberships)[number]>();
      memberships.forEach(m => {
        if (m.userId) membershipByGlobalUserId.set(m.userId, m);
      });

      let issues = 0;

      for (const user of orgUsers) {
        const membership =
          (user.globalUserId && membershipByGlobalUserId.get(user.globalUserId)) ||
          memberships.find(m => m.email === user.email);

        const orgUserRoles = user.roles.map(r => r.role.name);
        const membershipRoles = membership?.roles.map(r => r.role.name) ?? [];
        const displayName = membership?.displayName || user.displayName || user.email;

        const roleSource =
          membershipRoles.length > 0
            ? membershipRoles.join(', ')
            : orgUserRoles.length > 0
              ? orgUserRoles.join(', ')
              : '(none)';

        console.log(
          `- ${displayName} <${user.email}> | orgUserId=${user.id} | globalUserId=${
            user.globalUserId || 'n/a'
          } | membershipId=${membership?.id || 'n/a'} | roles: ${roleSource}`
        );

        // Flag issues
        if (!membership) {
          issues++;
          console.warn(
            `  ! No membership found; create membership for globalUserId=${user.globalUserId} (email=${user.email})`
          );
        } else if (membershipRoles.length === 0 && orgUserRoles.length > 0) {
          issues++;
          console.warn(
            `  ! Membership has no roles but orgUser does; consider syncing membership roles: [${orgUserRoles.join(
              ', '
            )}]`
          );
        } else if (membershipRoles.length === 0 && orgUserRoles.length === 0) {
          issues++;
          console.warn(`  ! No roles assigned (orgUser or membership)`);
        }
      }

      if (!orgUsers.length) {
        console.log('  (no org users)');
      }

      if (issues === 0) {
        console.log('  ✓ No role/membership issues detected.');
      } else {
        console.log(`  ! Detected ${issues} potential issue(s).`);
        console.log(
          '    Suggested fixes: ensure each org user has a membership and membership roles synced (assign roles via UI or update membershipRoles in DB).'
        );
      }
    }
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
