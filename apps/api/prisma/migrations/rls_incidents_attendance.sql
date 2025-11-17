-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR INCIDENTS & ATTENDANCE TABLES
-- ============================================================================

-- Enable RLS on incidents table
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents FORCE ROW LEVEL SECURITY;

-- Enable RLS on attendance table  
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- INCIDENTS TABLE POLICIES
-- ============================================================================

-- Policy for incidents: Users can only access incidents in their tenant
CREATE POLICY incidents_tenant_isolation ON incidents
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::TEXT);

-- Additional policy for incidents: Explicit tenant check
CREATE POLICY incidents_tenant_access ON incidents
    FOR ALL
    USING (
        tenant_id IS NOT NULL 
        AND tenant_id = current_setting('app.tenant_id', true)::TEXT
        AND current_setting('app.tenant_id', true) IS NOT NULL
        AND current_setting('app.tenant_id', true) != ''
    );

-- ============================================================================
-- ATTENDANCE TABLE POLICIES
-- ============================================================================

-- Policy for attendance: Users can only access attendance in their tenant
CREATE POLICY attendance_tenant_isolation ON attendance
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::TEXT);

-- Additional policy for attendance: Explicit tenant check
CREATE POLICY attendance_tenant_access ON attendance
    FOR ALL
    USING (
        tenant_id IS NOT NULL 
        AND tenant_id = current_setting('app.tenant_id', true)::TEXT
        AND current_setting('app.tenant_id', true) IS NOT NULL
        AND current_setting('app.tenant_id', true) != ''
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Note: Adjust role name as needed for your application
-- GRANT SELECT, INSERT, UPDATE, DELETE ON incidents TO your_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON attendance TO your_app_role;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================
-- To test RLS policies, you can run:
-- 
-- -- Set tenant context
-- SELECT set_config('app.tenant_id', 'test-tenant-id', true);
-- 
-- -- Test incidents access
-- SELECT * FROM incidents;
-- 
-- -- Test attendance access  
-- SELECT * FROM attendance;
-- 
-- -- Reset tenant context
-- SELECT set_config('app.tenant_id', '', true);
-- 
-- -- Verify no access without tenant context
-- SELECT * FROM incidents; -- Should return no rows
-- SELECT * FROM attendance; -- Should return no rows