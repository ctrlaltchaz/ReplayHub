-- Add docs permissions to all existing organizations
DO $$
DECLARE
    org_record RECORD;
BEGIN
    FOR org_record IN SELECT id FROM organisations
    LOOP
        -- Insert docs permissions for this organization
        INSERT INTO permissions (tenant_id, key, "group", description) VALUES
        (org_record.id, 'docs', 'docs', 'Access documentation module'),
        (org_record.id, 'docs.view', 'docs', 'View documentation (global and org)'),
        (org_record.id, 'docs.create', 'docs', 'Create organization documentation'),
        (org_record.id, 'docs.edit', 'docs', 'Edit organization documentation'),
        (org_record.id, 'docs.delete', 'docs', 'Delete organization documentation'),
        (org_record.id, 'docs.manage', 'docs', 'Manage documentation categories'),
        (org_record.id, 'docs.completions.track', 'docs', 'Mark tutorials as completed')
        ON CONFLICT (tenant_id, key) DO NOTHING;
        
        RAISE NOTICE 'Added docs permissions for organization: %', org_record.id;
    END LOOP;
END $$;

-- Grant docs permissions to existing roles
DO $$
DECLARE
    role_record RECORD;
    perm_record RECORD;
BEGIN
    -- For each organization's system roles
    FOR role_record IN 
        SELECT r.id as role_id, r.tenant_id, r.name 
        FROM roles r 
        WHERE r.is_system = true
    LOOP
        -- Administrator gets all docs permissions
        IF role_record.name = 'Administrator' THEN
            FOR perm_record IN 
                SELECT id FROM permissions 
                WHERE tenant_id = role_record.tenant_id 
                AND "group" = 'docs'
            LOOP
                INSERT INTO role_permissions (tenant_id, role_id, permission_id)
                VALUES (role_record.tenant_id, role_record.role_id, perm_record.id)
                ON CONFLICT DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Granted all docs permissions to Administrator role in org: %', role_record.tenant_id;
        END IF;
        
        -- Manager gets most permissions except delete
        IF role_record.name = 'Manager' THEN
            FOR perm_record IN 
                SELECT id FROM permissions 
                WHERE tenant_id = role_record.tenant_id 
                AND "group" = 'docs'
                AND key IN ('docs', 'docs.view', 'docs.create', 'docs.edit', 'docs.manage', 'docs.completions.track')
            LOOP
                INSERT INTO role_permissions (tenant_id, role_id, permission_id)
                VALUES (role_record.tenant_id, role_record.role_id, perm_record.id)
                ON CONFLICT DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Granted docs create/edit permissions to Manager role in org: %', role_record.tenant_id;
        END IF;
        
        -- Coordinator gets create/edit permissions
        IF role_record.name = 'Coordinator' THEN
            FOR perm_record IN 
                SELECT id FROM permissions 
                WHERE tenant_id = role_record.tenant_id 
                AND "group" = 'docs'
                AND key IN ('docs', 'docs.view', 'docs.create', 'docs.edit', 'docs.completions.track')
            LOOP
                INSERT INTO role_permissions (tenant_id, role_id, permission_id)
                VALUES (role_record.tenant_id, role_record.role_id, perm_record.id)
                ON CONFLICT DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Granted docs create/edit permissions to Coordinator role in org: %', role_record.tenant_id;
        END IF;
        
        -- Team Member gets view and track permissions
        IF role_record.name = 'Team Member' THEN
            FOR perm_record IN 
                SELECT id FROM permissions 
                WHERE tenant_id = role_record.tenant_id 
                AND "group" = 'docs'
                AND key IN ('docs', 'docs.view', 'docs.completions.track')
            LOOP
                INSERT INTO role_permissions (tenant_id, role_id, permission_id)
                VALUES (role_record.tenant_id, role_record.role_id, perm_record.id)
                ON CONFLICT DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Granted docs view/track permissions to Team Member role in org: %', role_record.tenant_id;
        END IF;
        
        -- Viewer gets view permission only
        IF role_record.name = 'Viewer' THEN
            FOR perm_record IN 
                SELECT id FROM permissions 
                WHERE tenant_id = role_record.tenant_id 
                AND "group" = 'docs'
                AND key IN ('docs', 'docs.view')
            LOOP
                INSERT INTO role_permissions (tenant_id, role_id, permission_id)
                VALUES (role_record.tenant_id, role_record.role_id, perm_record.id)
                ON CONFLICT DO NOTHING;
            END LOOP;
            RAISE NOTICE 'Granted docs view permission to Viewer role in org: %', role_record.tenant_id;
        END IF;
    END LOOP;
END $$;

-- Verify the changes
SELECT 
    o.name as organisation,
    COUNT(DISTINCT p.id) as docs_permissions_count,
    COUNT(DISTINCT rp.id) as role_permission_assignments
FROM organisations o
LEFT JOIN permissions p ON p.tenant_id = o.id AND p."group" = 'docs'
LEFT JOIN role_permissions rp ON rp.permission_id = p.id
GROUP BY o.id, o.name
ORDER BY o.name;