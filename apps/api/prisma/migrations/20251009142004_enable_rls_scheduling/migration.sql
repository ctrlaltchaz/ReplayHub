-- Enable RLS for scheduling tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY; 
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Force RLS for scheduling tables
ALTER TABLE events FORCE ROW LEVEL SECURITY;
ALTER TABLE resources FORCE ROW LEVEL SECURITY;
ALTER TABLE bookings FORCE ROW LEVEL SECURITY;

-- Create RLS policies for events table
CREATE POLICY events_tenant_isolation ON events
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Create RLS policies for resources table
CREATE POLICY resources_tenant_isolation ON resources
  USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Create RLS policies for bookings table
CREATE POLICY bookings_tenant_isolation ON bookings
  USING (tenant_id = current_setting('app.current_tenant_id', true));