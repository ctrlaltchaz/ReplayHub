-- Row Level Security policy for audit_logs table
CREATE POLICY audit_logs_tenant_isolation ON audit_logs
  USING (tenant_id = current_setting('app.tenant_id'));

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;