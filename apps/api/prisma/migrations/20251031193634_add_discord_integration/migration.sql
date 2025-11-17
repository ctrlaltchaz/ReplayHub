/*
  Warnings:

  - You are about to drop the `runsheet_item_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "checklists" ADD COLUMN     "completed_items" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "items_json" JSONB,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "template_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "global_users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "social_links" JSONB,
ADD COLUMN     "timezone" TEXT;

-- AlterTable
ALTER TABLE "inventory_movements" ALTER COLUMN "by_user_id" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."runsheet_item_templates";

-- CreateTable
CREATE TABLE "organization_discord" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bot_token" TEXT,
    "guild_id" TEXT,
    "guild_name" TEXT,
    "webhook_events" TEXT,
    "webhook_matches" TEXT,
    "webhook_roster" TEXT,
    "webhook_incidents" TEXT,
    "enable_channel_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_user_dms" BOOLEAN NOT NULL DEFAULT false,
    "enable_event_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_match_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_roster_notifications" BOOLEAN NOT NULL DEFAULT true,
    "enable_incident_notifications" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_discord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_discord_links" (
    "id" TEXT NOT NULL,
    "global_user_id" TEXT NOT NULL,
    "discord_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT,
    "avatar" TEXT,
    "enable_dms" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_discord_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_notification_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "delivery_method" TEXT NOT NULL,
    "recipient_id" TEXT,
    "channel_id" TEXT,
    "message_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_discord_tenant_id_key" ON "organization_discord"("tenant_id");

-- CreateIndex
CREATE INDEX "organization_discord_tenant_id_idx" ON "organization_discord"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_discord_links_discord_id_key" ON "user_discord_links"("discord_id");

-- CreateIndex
CREATE INDEX "user_discord_links_discord_id_idx" ON "user_discord_links"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_discord_links_global_user_id_key" ON "user_discord_links"("global_user_id");

-- CreateIndex
CREATE INDEX "discord_notification_logs_tenant_id_notification_type_statu_idx" ON "discord_notification_logs"("tenant_id", "notification_type", "status");

-- CreateIndex
CREATE INDEX "discord_notification_logs_created_at_idx" ON "discord_notification_logs"("created_at");

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_by_user_id_fkey" FOREIGN KEY ("by_user_id") REFERENCES "global_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_discord_links" ADD CONSTRAINT "user_discord_links_global_user_id_fkey" FOREIGN KEY ("global_user_id") REFERENCES "global_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
