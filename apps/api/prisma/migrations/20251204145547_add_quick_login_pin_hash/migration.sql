-- AlterTable
ALTER TABLE "global_users" ADD COLUMN IF NOT EXISTS "quick_login_pin_hash" TEXT;
