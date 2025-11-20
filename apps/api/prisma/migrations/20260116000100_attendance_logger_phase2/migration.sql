-- Attendance Logger Phase 2 migration

-- 1. Create enums
CREATE TYPE "AttendanceDepartment" AS ENUM ('broadcasting', 'graphics', 'social_media', 'production', 'camera_operator', 'other');
CREATE TYPE "AttendanceAbsenceReason" AS ENUM ('illness', 'appointment', 'forgot', 'other');
CREATE TYPE "AttendanceSource" AS ENUM ('student', 'auto', 'tutor', 'admin');

-- 2. Alter attendance table with new fields
ALTER TABLE "attendance"
    ADD COLUMN     "department" "AttendanceDepartment",
    ADD COLUMN     "role_notes" TEXT,
    ADD COLUMN     "absence_reason" "AttendanceAbsenceReason",
    ADD COLUMN     "absence_notes" TEXT,
    ADD COLUMN     "clock_in_at" TIMESTAMP(3),
    ADD COLUMN     "clock_out_at" TIMESTAMP(3),
    ADD COLUMN     "auto_clock_out" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN     "late_flag" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN     "source" "AttendanceSource" NOT NULL DEFAULT 'student',
    ADD COLUMN     "override_reason" TEXT,
    ADD COLUMN     "reviewed_by" TEXT,
    ADD COLUMN     "reviewed_at" TIMESTAMP(3),
    ADD COLUMN     "scheduled_date" TIMESTAMP(3),
    ALTER COLUMN   "status" SET DEFAULT 'pending';

-- 3. Add foreign key for reviewer
ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Backfill derived fields
-- Late flag is based on existing status value before remapping
UPDATE "attendance" SET "late_flag" = true WHERE "status" = 'late';

-- Normalize legacy statuses to new workflow
UPDATE "attendance" SET "status" = 'approved' WHERE "status" IN ('present', 'late', 'remote');
UPDATE "attendance" SET "status" = 'absent' WHERE "status" = 'no_show';

-- Default timestamps and metadata for legacy rows
UPDATE "attendance"
SET
    "clock_in_at" = COALESCE("clock_in_at", "created_at"),
    "clock_out_at" = COALESCE("clock_out_at", "created_at"),
    "source" = 'admin'
WHERE "clock_in_at" IS NULL OR "clock_out_at" IS NULL OR "source" IS NULL;

-- Populate scheduled_date from linked event start date (date-only via trunc)
UPDATE "attendance" AS a
SET "scheduled_date" = DATE_TRUNC('day', e."start_at")
FROM "events" AS e
WHERE a."event_id" = e."id";

-- 5. New indexes
CREATE INDEX "attendance_tenant_id_scheduled_date_idx" ON "attendance"("tenant_id", "scheduled_date");
CREATE INDEX "attendance_tenant_id_status_idx" ON "attendance"("tenant_id", "status");
CREATE INDEX "attendance_tenant_id_pending_idx" ON "attendance"("tenant_id") WHERE "status" = 'pending';
