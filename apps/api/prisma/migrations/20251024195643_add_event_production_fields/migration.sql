-- AlterTable
ALTER TABLE "events" ADD COLUMN     "broadcast_channel" TEXT,
ADD COLUMN     "call_time" TIMESTAMP(3),
ADD COLUMN     "checklist_id" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "event_type" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "game_title" TEXT,
ADD COLUMN     "graphics_package" TEXT,
ADD COLUMN     "production_lead" TEXT,
ADD COLUMN     "roster_id" TEXT;

-- CreateIndex
CREATE INDEX "events_tenant_id_event_type_idx" ON "events"("tenant_id", "event_type");

-- CreateIndex
CREATE INDEX "events_tenant_id_game_title_idx" ON "events"("tenant_id", "game_title");

-- CreateIndex
CREATE INDEX "events_tenant_id_production_lead_idx" ON "events"("tenant_id", "production_lead");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_production_lead_fkey" FOREIGN KEY ("production_lead") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
