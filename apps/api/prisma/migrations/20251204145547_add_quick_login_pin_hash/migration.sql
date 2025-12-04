-- AlterTable
ALTER TABLE "global_users"
ADD COLUMN IF NOT EXISTS "quick_login_pin_hash" TEXT,
ADD COLUMN IF NOT EXISTS "quick_login_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "quick_login_device_id" TEXT;