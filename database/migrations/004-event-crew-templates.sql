-- Migration: Event Crew/Talent Templates
-- Description: Add templates for quickly assigning talent and crew to events

-- Crew/Talent Templates
CREATE TABLE IF NOT EXISTS event_crew_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tenant_id TEXT NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL REFERENCES org_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Template Members (talent/crew assignments in the template)
CREATE TABLE IF NOT EXISTS event_crew_template_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    template_id TEXT NOT NULL REFERENCES event_crew_templates(id) ON DELETE CASCADE,
    org_user_id TEXT NOT NULL REFERENCES org_users(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, org_user_id, role)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_crew_templates_tenant ON event_crew_templates (tenant_id);

CREATE INDEX IF NOT EXISTS idx_template_members_template ON event_crew_template_members (template_id);

-- Add template_id to event_staff_assignments for tracking which template was used
ALTER TABLE event_staff_assignments
ADD COLUMN IF NOT EXISTS template_id TEXT REFERENCES event_crew_templates (id) ON DELETE SET NULL;