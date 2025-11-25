-- Event staff assignments: link events to org users with broadcast roles

CREATE TABLE "event_staff_assignments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "org_user_id" TEXT NOT NULL,
    "role_type" TEXT NOT NULL,
    "role_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_staff_assignments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_staff_assignments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_staff_assignments_org_user_id_fkey" FOREIGN KEY ("org_user_id") REFERENCES "org_users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Keep per-tenant uniqueness to prevent duplicate assignments
CREATE UNIQUE INDEX "event_staff_assignments_tenant_id_event_id_org_user_id_key" ON "event_staff_assignments"("tenant_id", "event_id", "org_user_id");
CREATE INDEX "event_staff_assignments_tenant_id_event_id_idx" ON "event_staff_assignments"("tenant_id", "event_id");
