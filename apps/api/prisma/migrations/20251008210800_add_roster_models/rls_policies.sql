-- Enable RLS on roster tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams FORCE ROW LEVEL SECURITY;

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE players FORCE ROW LEVEL SECURITY;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members FORCE ROW LEVEL SECURITY;

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability FORCE ROW LEVEL SECURITY;

ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups FORCE ROW LEVEL SECURITY;

ALTER TABLE lineup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_slots FORCE ROW LEVEL SECURITY;

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements FORCE ROW LEVEL SECURITY;

-- Create RLS policies for roster tables
CREATE POLICY teams_tenant_policy ON teams
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY players_tenant_policy ON players
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY team_members_tenant_policy ON team_members
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY availability_tenant_policy ON availability
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY lineups_tenant_policy ON lineups
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY lineup_slots_tenant_policy ON lineup_slots
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));

CREATE POLICY achievements_tenant_policy ON achievements
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id'));