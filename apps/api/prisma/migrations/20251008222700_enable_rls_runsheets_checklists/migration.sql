-- Enable RLS for runsheets and checklists tables

-- Enable RLS on runsheets table
ALTER TABLE runsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE runsheets FORCE ROW LEVEL SECURITY;

CREATE POLICY runsheets_tenant_isolation ON runsheets
    USING (tenant_id = current_setting('app.tenant_id'));

-- Enable RLS on runsheet_items table
ALTER TABLE runsheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE runsheet_items FORCE ROW LEVEL SECURITY;

CREATE POLICY runsheet_items_tenant_isolation ON runsheet_items
    USING (tenant_id = current_setting('app.tenant_id'));

-- Enable RLS on checklist_templates table
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates FORCE ROW LEVEL SECURITY;

CREATE POLICY checklist_templates_tenant_isolation ON checklist_templates
    USING (tenant_id = current_setting('app.tenant_id'));

-- Enable RLS on checklists table
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists FORCE ROW LEVEL SECURITY;

CREATE POLICY checklists_tenant_isolation ON checklists
    USING (tenant_id = current_setting('app.tenant_id'));

-- Enable RLS on checklist_runs table
ALTER TABLE checklist_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_runs FORCE ROW LEVEL SECURITY;

CREATE POLICY checklist_runs_tenant_isolation ON checklist_runs
    USING (tenant_id = current_setting('app.tenant_id'));