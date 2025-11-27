DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'production_sessions') THEN
        ALTER TABLE "public"."production_sessions" DROP CONSTRAINT IF EXISTS "production_sessions_tenant_id_fkey";
        ALTER TABLE "production_sessions" ALTER COLUMN "updated_at" DROP DEFAULT;
        ALTER TABLE "production_sessions"
            ADD CONSTRAINT "production_sessions_tenant_id_fkey"
            FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;
