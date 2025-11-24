-- CreateTable
CREATE TABLE "discord_scheduled_notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "mention_role_id" TEXT,
    "mention_everyone" BOOLEAN NOT NULL DEFAULT false,
    "embed_title" TEXT NOT NULL,
    "embed_description" TEXT,
    "embed_color" INTEGER,
    "embed_fields" JSONB,
    "embed_url" TEXT,
    "timezone" TEXT NOT NULL,
    "first_run_at" TIMESTAMP(3) NOT NULL,
    "next_run_at" TIMESTAMP(3),
    "last_run_at" TIMESTAMP(3),
    "recurrence_type" TEXT NOT NULL DEFAULT 'none',
    "recurrence_interval" INTEGER NOT NULL DEFAULT 1,
    "end_after_runs" INTEGER,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discord_scheduled_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_scheduled_notification_runs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "run_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_scheduled_notification_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "discord_scheduled_notifications_tenant_id_status_next_run_at_idx" ON "discord_scheduled_notifications"("tenant_id", "status", "next_run_at");

-- CreateIndex
CREATE INDEX "discord_scheduled_notifications_tenant_id_status_idx" ON "discord_scheduled_notifications"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "discord_scheduled_notification_runs_tenant_id_notification__idx" ON "discord_scheduled_notification_runs"("tenant_id", "notification_id");

-- AddForeignKey
ALTER TABLE "discord_scheduled_notification_runs" ADD CONSTRAINT "discord_scheduled_notification_runs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "discord_scheduled_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
