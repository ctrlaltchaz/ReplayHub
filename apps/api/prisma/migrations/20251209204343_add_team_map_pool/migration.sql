-- CreateColumn: Add map_pool_json to teams table
-- This allows each team to define their own custom map pool for match logging

ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "map_pool_json" JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN "teams"."map_pool_json" IS 'Custom map pool for this team. Empty array means use game defaults.';