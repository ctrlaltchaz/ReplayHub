import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyRLS() {
  try {
    // Enable RLS on audit_logs table
    await prisma.$executeRaw`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`;

    // Create RLS policy for tenant isolation
    await prisma.$executeRaw`
      CREATE POLICY audit_logs_tenant_isolation ON audit_logs
        USING (tenant_id = current_setting('app.tenant_id'))
    `;

    console.log('✅ RLS policies applied successfully for audit_logs table');
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyRLS();
