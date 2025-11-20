-- Link production sessions to events
ALTER TABLE "production_sessions"
    ADD COLUMN "event_id" TEXT;

ALTER TABLE "production_sessions"
    ADD CONSTRAINT "production_sessions_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "production_sessions_tenant_id_event_id_idx" ON "production_sessions"("tenant_id", "event_id");
