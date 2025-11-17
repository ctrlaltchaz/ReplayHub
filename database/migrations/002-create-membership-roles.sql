-- Migration: Add membership_roles table for new role assignment system
-- This table links UserOrganisationMembership to Roles

-- Drop table if it exists (for clean migration)
DROP TABLE IF EXISTS membership_roles CASCADE;

-- Create the table
CREATE TABLE membership_roles (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    membership_id TEXT NOT NULL REFERENCES user_org_memberships (id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        tenant_id,
        membership_id,
        role_id
    )
);

-- Create indexes for performance
CREATE INDEX idx_membership_roles_tenant_membership ON membership_roles (tenant_id, membership_id);

CREATE INDEX idx_membership_roles_role ON membership_roles (role_id);

-- Enable RLS
ALTER TABLE membership_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see roles for their own tenant
CREATE POLICY tenant_isolation_membership_roles ON membership_roles
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::text);

COMMENT ON
TABLE membership_roles IS 'Links user memberships to roles in the new unified auth system';