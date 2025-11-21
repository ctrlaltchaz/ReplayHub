/**
 * Audit + repair users/roles per organisation.
 *
 * Run (from repo root):
 *   npx ts-node apps/api/scripts/check-org-user-roles.ts          # all orgs
 *   npx ts-node apps/api/scripts/check-org-user-roles.ts --org myorgslug
 *
 * DATABASE_URL must be set.
 */
import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string) =>
  new Promise<string>(resolve => rl.question(q, ans => resolve(ans.trim())));
const confirm = async (msg: string) => (await ask(`${msg} [y/N]: `)).toLowerCase() === 'y';

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

      const memberships = await prisma.userOrganisationMembership.findMany({
        where: { tenantId: organisation.id },
        include: { roles: { include: { role: true } } },
        orderBy: { createdAt: 'desc' },
      });

      const orgUsers = await prisma.orgUser.findMany({
        where: { tenantId: organisation.id },
        include: { roles: { include: { role: true } } },
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

        // Issue: no membership
        if (!membership) {
          issues++;
          console.warn(
            `  ! No membership found; create membership for globalUserId=${user.globalUserId} (email=${user.email})`
          );
          if (await confirm('    Create membership now?')) {
            const newMembership = await prisma.userOrganisationMembership.create({
              data: {
                tenantId: organisation.id,
                userId: user.globalUserId || undefined,
                email: user.email,
                displayName,
                isActive: user.isActive,
              },
            });
            if (orgUserRoles.length > 0) {
              const roleRecords = await prisma.role.findMany({
                where: { tenantId: organisation.id, name: { in: orgUserRoles } },
              });
              if (roleRecords.length) {
                await prisma.membershipRole.createMany({
                  data: roleRecords.map(r => ({
                    tenantId: organisation.id,
                    membershipId: newMembership.id,
                    roleId: r.id,
                  })),
                });
              }
            }
            console.log(
              `    ✓ Created membership ${newMembership.id} and synced roles [${orgUserRoles.join(', ') || 'none'}]`
            );
          }
          continue;
        }

        // Issue: membership has no roles but orgUser does
        if (membershipRoles.length === 0 && orgUserRoles.length > 0) {
          issues++;
          console.warn(
            `  ! Membership has no roles but orgUser does; sync membership roles? [${orgUserRoles.join(', ')}]`
          );
          if (await confirm('    Sync membership roles from orgUser?')) {
            const roleRecords = await prisma.role.findMany({
              where: { tenantId: organisation.id, name: { in: orgUserRoles } },
            });
            await prisma.membershipRole.deleteMany({
              where: { tenantId: organisation.id, membershipId: membership.id },
            });
            if (roleRecords.length) {
              await prisma.membershipRole.createMany({
                data: roleRecords.map(r => ({
                  tenantId: organisation.id,
                  membershipId: membership.id,
                  roleId: r.id,
                })),
              });
              console.log(
                `    ✓ Synced membership roles to [${roleRecords.map(r => r.name).join(', ')}]`
              );
            } else {
              console.log('    ! No matching roles found; skipped syncing.');
            }
          }
          continue;
        }

        // Issue: no roles anywhere
        if (membershipRoles.length === 0 && orgUserRoles.length === 0) {
          issues++;
          console.warn(`  ! No roles assigned (orgUser or membership)`);
          if (await confirm('    Assign a role to this membership?')) {
            const roleName = await ask('    Role name to assign: ');
            if (roleName) {
              const roleRecord = await prisma.role.findFirst({
                where: { tenantId: organisation.id, name: roleName },
              });
              if (roleRecord) {
                await prisma.membershipRole.create({
                  data: {
                    tenantId: organisation.id,
                    membershipId: membership.id,
                    roleId: roleRecord.id,
                  },
                });
                console.log(
                  `    ✓ Assigned role ${roleRecord.name} to membership ${membership.id}`
                );
              } else {
                console.log(`    ! Role "${roleName}" not found; skipped.`);
              }
            } else {
              console.log('    ! No role provided; skipped.');
            }
          }
        }
      }

      if (!orgUsers.length) {
        console.log('  (no org users)');
      }

      if (issues === 0) {
        console.log('  ✓ No role/membership issues detected.');
      } else {
        console.log(`  ! Detected ${issues} potential issue(s).`);
      }
    }
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
})();
