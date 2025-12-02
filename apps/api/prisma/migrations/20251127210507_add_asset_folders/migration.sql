-- DropForeignKey (if exists)
ALTER TABLE "public"."password_audit_logs" DROP CONSTRAINT IF EXISTS "password_audit_logs_tenant_id_fkey";

-- DropForeignKey (if exists)
ALTER TABLE "public"."password_entries" DROP CONSTRAINT IF EXISTS "password_entries_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."production_sessions" DROP CONSTRAINT "production_sessions_tenant_id_fkey";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN "folder_id" TEXT;

-- AlterTable
ALTER TABLE "event_staff_assignments"
ALTER COLUMN "updated_at"
DROP DEFAULT;

-- AlterTable
ALTER TABLE "live_graphics" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "password_entries"
ALTER COLUMN "updated_at"
DROP DEFAULT;

-- AlterTable
ALTER TABLE "production_sessions"
ALTER COLUMN "updated_at"
DROP DEFAULT;

-- CreateTable
CREATE TABLE "asset_folders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "asset_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_folders_tenant_id_idx" ON "asset_folders" ("tenant_id");

-- CreateIndex
CREATE INDEX "asset_folders_tenant_id_parent_id_idx" ON "asset_folders" ("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "assets_tenant_id_folder_id_idx" ON "assets" ("tenant_id", "folder_id");

-- AddForeignKey
ALTER TABLE "asset_folders"
ADD CONSTRAINT "asset_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "asset_folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Temporarily disable RLS to add foreign key constraint
ALTER TABLE "assets" DISABLE ROW LEVEL SECURITY;

-- AddForeignKey
ALTER TABLE "assets"
ADD CONSTRAINT "assets_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "asset_folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Re-enable RLS
ALTER TABLE "assets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "assets" FORCE ROW LEVEL SECURITY;

-- AddForeignKey
ALTER TABLE "production_sessions"
ADD CONSTRAINT "production_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;