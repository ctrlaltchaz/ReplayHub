-- AlterTable
ALTER TABLE "discord_scheduled_notifications"
    ADD COLUMN "delivery_method" TEXT NOT NULL DEFAULT 'channel',
    ALTER COLUMN "channel_id" DROP NOT NULL;
