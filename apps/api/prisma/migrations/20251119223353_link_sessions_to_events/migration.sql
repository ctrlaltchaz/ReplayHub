-- Ensure tenant context GUCs exist for policies that reference current_setting('app.tenant_id')
DO $$
BEGIN
    PERFORM set_config('app.tenant_id', current_setting('app.tenant_id', true), false);
    PERFORM set_config('app.current_tenant_id', current_setting('app.current_tenant_id', true), false);
EXCEPTION
    WHEN OTHERS THEN
        -- Fallback to a bootstrap value if not already present
        PERFORM set_config('app.tenant_id', 'bootstrap', false);
        PERFORM set_config('app.current_tenant_id', 'bootstrap', false);
END
$$;

DO $$
BEGIN
    ALTER TABLE "public"."production_sessions" DROP CONSTRAINT IF EXISTS "production_sessions_tenant_id_fkey";
EXCEPTION
    WHEN undefined_table THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE "production_sessions" ALTER COLUMN "updated_at" DROP DEFAULT;
EXCEPTION
    WHEN undefined_table THEN NULL;
END
$$;

ALTER TABLE "runsheets"
    ADD CONSTRAINT "runsheets_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DO $$
BEGIN
    ALTER TABLE "production_sessions"
        ADD CONSTRAINT "production_sessions_tenant_id_fkey"
        FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
END
$$;
