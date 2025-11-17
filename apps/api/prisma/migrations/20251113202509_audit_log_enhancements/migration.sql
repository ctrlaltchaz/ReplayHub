/*
  Warnings:

  - You are about to drop the column `details` on the `audit_logs` table. All the data in the column will be lost.
  - Changed the type of `action` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."audit_logs_tenant_id_entity_type_entity_id_idx";

-- DropIndex
DROP INDEX "public"."audit_logs_tenant_id_entity_type_idx";

-- DropIndex
DROP INDEX "public"."audit_logs_tenant_id_idx";

-- DropIndex
DROP INDEX "public"."audit_logs_tenant_id_org_user_id_idx";

-- DropIndex
DROP INDEX "public"."org_invites_tenant_id_email_accepted_at_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "details",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endpoint" TEXT,
ADD COLUMN     "entity" TEXT,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'success',
DROP COLUMN "action",
ADD COLUMN     "action" TEXT NOT NULL,
ALTER COLUMN "entity_type" DROP NOT NULL,
ALTER COLUMN "entity_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_action_created_at_idx" ON "audit_logs"("tenant_id", "action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_status_created_at_idx" ON "audit_logs"("tenant_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
