-- Retarget password relations to user organisation memberships

-- Drop old FKs to org_users
DO $$
BEGIN
    -- Drop old FKs to org_users if present
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'password_entries_created_by_fkey'
    ) THEN
        ALTER TABLE "password_entries" DROP CONSTRAINT "password_entries_created_by_fkey";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'password_entries_updated_by_fkey'
    ) THEN
        ALTER TABLE "password_entries" DROP CONSTRAINT "password_entries_updated_by_fkey";
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'password_audit_logs_org_user_id_fkey'
    ) THEN
        ALTER TABLE "password_audit_logs" DROP CONSTRAINT "password_audit_logs_org_user_id_fkey";
    END IF;

    -- Only add new FKs if membership table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'user_org_memberships'
    ) THEN
        ALTER TABLE "password_entries"
            ADD CONSTRAINT "password_entries_created_by_fkey"
                FOREIGN KEY ("created_by") REFERENCES "user_org_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            ADD CONSTRAINT "password_entries_updated_by_fkey"
                FOREIGN KEY ("updated_by") REFERENCES "user_org_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

        ALTER TABLE "password_audit_logs"
            ADD CONSTRAINT "password_audit_logs_org_user_id_fkey"
                FOREIGN KEY ("org_user_id") REFERENCES "user_org_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    ELSE
        RAISE NOTICE 'Table user_org_memberships not found; skipping password FK updates';
    END IF;
END $$;
