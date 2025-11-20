-- Create production sessions table
CREATE TABLE "production_sessions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "session_date" TIMESTAMP(3) NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "window_end" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_rule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_sessions_pkey" PRIMARY KEY ("id")
);

-- Add session reference to attendance
ALTER TABLE "attendance"
    ADD COLUMN "session_id" TEXT;

-- Indexes to support lookups
CREATE INDEX "production_sessions_tenant_id_session_date_idx" ON "production_sessions"("tenant_id", "session_date");
CREATE INDEX "attendance_tenant_id_session_id_idx" ON "attendance"("tenant_id", "session_id");

-- Foreign keys
ALTER TABLE "production_sessions"
    ADD CONSTRAINT "production_sessions_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "production_sessions"
    ADD CONSTRAINT "production_sessions_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "production_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
