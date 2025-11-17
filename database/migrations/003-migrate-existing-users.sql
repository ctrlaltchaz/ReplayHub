-- Migration 003: Migrate existing org_users and org_user_roles to new system
-- This migrates all existing users from the legacy system to user_org_memberships and membership_roles

-- Step 1: Migrate existing org_users to user_org_memberships
-- Only insert if membership doesn't already exist for this user+tenant combination
INSERT INTO
    user_org_memberships (
        id,
        tenant_id,
        global_user_id,
        status,
        created_at,
        updated_at
    )
SELECT ou.id, ou.tenant_id, ou.global_user_id, ou.status, ou.created_at, ou.updated_at
FROM org_users ou
WHERE
    NOT EXISTS (
        SELECT 1
        FROM user_org_memberships uom
        WHERE
            uom.global_user_id = ou.global_user_id
            AND uom.tenant_id = ou.tenant_id
    )
    AND ou.global_user_id IS NOT NULL;

-- Step 2: Migrate existing org_user_roles to membership_roles
-- Only insert if the role assignment doesn't already exist
INSERT INTO membership_roles (
    id, 
    tenant_id, 
    membership_id, 
    role_id, 
    created_at
)
SELECT 
    gen_random_uuid()::text,
    our.tenant_id,
    our.org_user_id, -- This becomes the membership_id (same ID as the org_user)
    our.role_id,
    our.created_at
FROM org_user_roles our
WHERE NOT EXISTS (
    SELECT 1 
    FROM membership_roles mr 
    WHERE mr.membership_id = our.org_user_id 
    AND mr.role_id = our.role_id
)
-- Only migrate if the corresponding membership exists
AND EXISTS (
    SELECT 1
    FROM user_org_memberships uom
    WHERE uom.id = our.org_user_id
);

-- Display migration results
DO $$
DECLARE
    memberships_count INTEGER;
    roles_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO memberships_count FROM user_org_memberships;
    SELECT COUNT(*) INTO roles_count FROM membership_roles;
    
    RAISE NOTICE 'Migration complete:';
    RAISE NOTICE '  - Total memberships: %', memberships_count;
    RAISE NOTICE '  - Total role assignments: %', roles_count;
END $$;