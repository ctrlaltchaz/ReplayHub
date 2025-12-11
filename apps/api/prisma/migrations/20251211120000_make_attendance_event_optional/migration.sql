-- Make eventId optional in attendance table
ALTER TABLE "attendance" ALTER COLUMN "event_id" DROP NOT NULL;

-- Drop old unique constraint that included eventId
DROP INDEX IF EXISTS "attendance_tenant_id_event_id_org_user_id_key";

-- Create new unique constraint based on session and user
-- Note: This allows NULL sessionId, so uses a partial index
CREATE UNIQUE INDEX "attendance_session_user_unique" ON "attendance" (
    "tenant_id",
    "session_id",
    "org_user_id"
)
WHERE
    "session_id" IS NOT NULL;