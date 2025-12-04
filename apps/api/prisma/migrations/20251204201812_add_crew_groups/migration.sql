-- CreateTable for crew groups

CREATE TABLE IF NOT EXISTS "event_crew_template_groups" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_crew_template_groups_pkey" PRIMARY KEY ("id")
);

-- Add group_id to members table
ALTER TABLE "event_crew_template_members"
ADD COLUMN IF NOT EXISTS "group_id" TEXT;

-- Remove role column (replaced by group assignment)
ALTER TABLE "event_crew_template_members"
DROP COLUMN IF EXISTS "role";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_crew_template_groups_template_id_idx" ON "event_crew_template_groups" ("template_id");

CREATE INDEX IF NOT EXISTS "event_crew_template_members_group_id_idx" ON "event_crew_template_members" ("group_id");

-- AddForeignKey
ALTER TABLE "event_crew_template_groups"
ADD CONSTRAINT "event_crew_template_groups_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "event_crew_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_crew_template_members"
ADD CONSTRAINT "event_crew_template_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "event_crew_template_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE;