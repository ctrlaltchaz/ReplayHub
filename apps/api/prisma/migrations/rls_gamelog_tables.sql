-- Enable Row Level Security (RLS) and create tenant isolation policies for GameLog tables

-- ===== MATCHES TABLE =====
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches FORCE ROW LEVEL SECURITY;

-- SELECT policy for matches
CREATE POLICY tenant_isolation_select ON matches
    FOR SELECT
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- INSERT policy for matches
CREATE POLICY tenant_isolation_insert ON matches
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- UPDATE policy for matches
CREATE POLICY tenant_isolation_update ON matches
    FOR UPDATE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- DELETE policy for matches
CREATE POLICY tenant_isolation_delete ON matches
    FOR DELETE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ===== MAP_GAMES TABLE =====
ALTER TABLE map_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_games FORCE ROW LEVEL SECURITY;

-- SELECT policy for map_games
CREATE POLICY tenant_isolation_select ON map_games
    FOR SELECT
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- INSERT policy for map_games
CREATE POLICY tenant_isolation_insert ON map_games
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- UPDATE policy for map_games
CREATE POLICY tenant_isolation_update ON map_games
    FOR UPDATE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- DELETE policy for map_games
CREATE POLICY tenant_isolation_delete ON map_games
    FOR DELETE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ===== PLAYER_STATS TABLE =====
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats FORCE ROW LEVEL SECURITY;

-- SELECT policy for player_stats
CREATE POLICY tenant_isolation_select ON player_stats
    FOR SELECT
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- INSERT policy for player_stats
CREATE POLICY tenant_isolation_insert ON player_stats
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- UPDATE policy for player_stats
CREATE POLICY tenant_isolation_update ON player_stats
    FOR UPDATE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- DELETE policy for player_stats
CREATE POLICY tenant_isolation_delete ON player_stats
    FOR DELETE
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ===== VALIDATION CONSTRAINTS =====

-- Ensure gameIdx is contiguous starting at 1 for each match
CREATE OR REPLACE FUNCTION validate_map_game_idx() RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT: check if gameIdx creates gaps
    IF TG_OP = 'INSERT' THEN
        -- Check if this gameIdx already exists
        IF EXISTS (
            SELECT 1 FROM map_games 
            WHERE tenant_id = NEW.tenant_id 
            AND match_id = NEW.match_id 
            AND game_idx = NEW.game_idx
        ) THEN
            RAISE EXCEPTION 'gameIdx % already exists for match %', NEW.game_idx, NEW.match_id;
        END IF;
        
        -- Check if gameIdx creates a gap (should be max existing + 1, or 1 if none exist)
        IF NEW.game_idx > 1 AND NOT EXISTS (
            SELECT 1 FROM map_games 
            WHERE tenant_id = NEW.tenant_id 
            AND match_id = NEW.match_id 
            AND game_idx = NEW.game_idx - 1
        ) THEN
            RAISE EXCEPTION 'gameIdx % creates a gap in sequence for match %', NEW.game_idx, NEW.match_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_map_game_idx_trigger
    BEFORE INSERT OR UPDATE ON map_games
    FOR EACH ROW EXECUTE FUNCTION validate_map_game_idx();

-- ===== VERIFICATION =====

-- Verify RLS is enabled on all GameLog tables
DO $$
BEGIN
    -- Check matches table
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'matches' AND pc.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not properly enabled on matches table';
    END IF;
    
    -- Check map_games table
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'map_games' AND pc.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not properly enabled on map_games table';
    END IF;
    
    -- Check player_stats table
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables pt
        JOIN pg_class pc ON pc.relname = pt.tablename
        WHERE pt.tablename = 'player_stats' AND pc.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not properly enabled on player_stats table';
    END IF;
    
    RAISE NOTICE 'RLS successfully enabled on all GameLog tables (matches, map_games, player_stats)';
END $$;