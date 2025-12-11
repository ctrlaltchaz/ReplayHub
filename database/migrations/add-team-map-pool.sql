-- Add map_pool_json column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS map_pool_json JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN teams.map_pool_json IS 'Custom map pool for this team. Array of map names. Falls back to game defaults if empty.';