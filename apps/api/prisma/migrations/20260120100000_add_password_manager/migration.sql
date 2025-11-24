-- Password manager schema

-- Enum for password audit actions
CREATE TYPE "PasswordAuditAction" AS ENUM ('VIEW', 'CREATE', 'UPDATE', 'DELETE');

-- Vault entries
CREATE TABLE "password_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT,
    "password_encrypted" TEXT NOT NULL,
    "url" TEXT,
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_viewed_at" TIMESTAMP(3),
    CONSTRAINT "password_entries_pkey" PRIMARY KEY ("id")
);

-- Audit log of password access
CREATE TABLE "password_audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "password_id" TEXT NOT NULL,
    "org_user_id" TEXT NOT NULL,
    "action" "PasswordAuditAction" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "password_entries_tenant_id_idx" ON "password_entries"("tenant_id");
CREATE INDEX "password_audit_logs_tenant_id_password_id_idx" ON "password_audit_logs"("tenant_id", "password_id");
CREATE INDEX "password_audit_logs_tenant_id_org_user_id_idx" ON "password_audit_logs"("tenant_id", "org_user_id");

-- Foreign keys
ALTER TABLE "password_entries"
    ADD CONSTRAINT "password_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "password_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "org_users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "password_entries_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "password_audit_logs"
    ADD CONSTRAINT "password_audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "password_audit_logs_password_id_fkey" FOREIGN KEY ("password_id") REFERENCES "password_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "password_audit_logs_org_user_id_fkey" FOREIGN KEY ("org_user_id") REFERENCES "org_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
