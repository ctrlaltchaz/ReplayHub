const {
  PrismaClient,
} = require('C:/Users/charl/Desktop/WNC/IMPROVEDAPP/apps/node_modules/@prisma/client');
const prisma = new PrismaClient();
const slug = 'test' || 'test';
const limit = 20 || 20;
const providedTenantId = '';

(async () => {
  try {
    let tenantId = providedTenantId || null;
    if (!tenantId) {
      const rows =
        await prisma.$queryRaw`SELECT id FROM organisations WHERE slug = ${slug} LIMIT 1;`;
      tenantId = rows?.[0]?.id;
    }
    if (!tenantId) {
      console.error(`Tenant not found for slug '${slug}'. Provide --tenant-id to override.`);
      process.exit(1);
    }
    const rows =
      await prisma.$queryRaw`SELECT action, status, description, entity, entity_type, entity_id, org_user_id, created_at FROM audit_logs WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT ${limit};`;
    console.log(JSON.stringify({ tenantId, count: rows.length, rows }, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
