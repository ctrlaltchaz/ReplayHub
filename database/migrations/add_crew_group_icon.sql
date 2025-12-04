-- Add icon column to event_crew_template_groups
ALTER TABLE "event_crew_template_groups"
ADD COLUMN IF NOT EXISTS "icon" TEXT;

COMMENT ON COLUMN "event_crew_template_groups"."icon" IS 'Lucide icon name for the crew group';