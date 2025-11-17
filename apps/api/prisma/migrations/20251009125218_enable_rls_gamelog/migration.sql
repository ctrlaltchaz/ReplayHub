-- Enable RLS for GameLog tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches FORCE ROW LEVEL SECURITY;

ALTER TABLE map_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_games FORCE ROW LEVEL SECURITY;

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats FORCE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_select ON matches FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_insert ON matches FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_update ON matches FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')) WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_delete ON matches FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY tenant_isolation_select ON map_games FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_insert ON map_games FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_update ON map_games FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')) WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_delete ON map_games FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY tenant_isolation_select ON player_stats FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_insert ON player_stats FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_update ON player_stats FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id')) WITH CHECK (tenant_id = current_setting('app.current_tenant_id'));
CREATE POLICY tenant_isolation_delete ON player_stats FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id'));