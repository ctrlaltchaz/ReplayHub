-- Ensure entity column exists (older databases may predate AuditLog enhancements)
ALTER TABLE "audit_logs"
ADD COLUMN IF NOT EXISTS "entity" TEXT;

-- Add indexes to support audit log filtering by entity, entity type, and org user
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_entity_created_at_idx" ON "audit_logs"("tenant_id", "entity", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_entity_type_created_at_idx" ON "audit_logs"("tenant_id", "entity_type", "created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_tenant_id_org_user_id_created_at_idx" ON "audit_logs"("tenant_id", "org_user_id", "created_at");
