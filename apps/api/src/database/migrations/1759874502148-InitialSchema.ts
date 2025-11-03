import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759874502148 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable required extensions
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        // ============================================================================
        // GLOBAL LAYER TABLES (not tenant-scoped)
        // ============================================================================

        // Global users who can create and manage organizations
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "global_users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "email" VARCHAR(255) UNIQUE NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "name" VARCHAR(255) NOT NULL,
                "email_verified" BOOLEAN DEFAULT FALSE,
                "totp_secret" VARCHAR(32),
                "backup_codes" TEXT[],
                "is_active" BOOLEAN DEFAULT TRUE,
                "last_login_at" TIMESTAMPTZ,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Organizations (tenants)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organizations" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "slug" VARCHAR(63) UNIQUE NOT NULL,
                "name" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "branding" JSONB,
                "settings" JSONB DEFAULT '{}',
                "is_active" BOOLEAN DEFAULT TRUE,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Organization ownership/administration
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization_admins" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "global_user_id" UUID NOT NULL REFERENCES "global_users"("id") ON DELETE CASCADE,
                "role" VARCHAR(50) NOT NULL DEFAULT 'owner',
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("organization_id", "global_user_id")
            )
        `);

        // Feature flags per organization
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization_features" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "feature_key" VARCHAR(100) NOT NULL,
                "enabled" BOOLEAN DEFAULT TRUE,
                "config" JSONB DEFAULT '{}',
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("organization_id", "feature_key")
            )
        `);

        // ============================================================================
        // TENANT-SCOPED TABLES (with RLS)
        // ============================================================================

        // Organization-scoped users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "org_users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "email" VARCHAR(255) NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "name" VARCHAR(255) NOT NULL,
                "avatar_url" VARCHAR(500),
                "phone" VARCHAR(50),
                "is_active" BOOLEAN DEFAULT TRUE,
                "totp_secret" VARCHAR(32),
                "last_login_at" TIMESTAMPTZ,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("organization_id", "email")
            )
        `);

        // Continue with all other tables...
        // (I'll add them in chunks for readability)

        // Role definitions within organizations
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "name" VARCHAR(100) NOT NULL,
                "description" TEXT,
                "is_system" BOOLEAN DEFAULT FALSE,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("organization_id", "name")
            )
        `);

        // Permission definitions
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "permissions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "module" VARCHAR(50) NOT NULL,
                "resource" VARCHAR(50) NOT NULL,
                "action" VARCHAR(50) NOT NULL,
                "description" TEXT,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("organization_id", "module", "resource", "action")
            )
        `);

        // Role-Permission assignments
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "role_permissions" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
                "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("role_id", "permission_id")
            )
        `);

        // User-Role assignments
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "org_user_roles" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "org_user_id" UUID NOT NULL REFERENCES "org_users"("id") ON DELETE CASCADE,
                "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
                "assigned_by" UUID REFERENCES "org_users"("id"),
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE("org_user_id", "role_id")
            )
        `);

        // Resources that can be booked
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "resources" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "name" VARCHAR(255) NOT NULL,
                "type" VARCHAR(100) NOT NULL,
                "description" TEXT,
                "capacity" INTEGER,
                "location" VARCHAR(500),
                "metadata" JSONB DEFAULT '{}',
                "is_active" BOOLEAN DEFAULT TRUE,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Events/appointments
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "events" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "organization_id" UUID NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
                "title" VARCHAR(255) NOT NULL,
                "description" TEXT,
                "type" VARCHAR(100) NOT NULL,
                "status" VARCHAR(50) DEFAULT 'scheduled',
                "start_time" TIMESTAMPTZ NOT NULL,
                "end_time" TIMESTAMPTZ NOT NULL,
                "location" VARCHAR(500),
                "metadata" JSONB DEFAULT '{}',
                "created_by" UUID NOT NULL REFERENCES "org_users"("id"),
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Continue with remaining tables...
        // (Adding key business tables for now, can extend later)

        // ============================================================================
        // INDEXES
        // ============================================================================

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_global_users_email" ON "global_users"("email")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_global_users_active" ON "global_users"("is_active") WHERE "is_active" = TRUE`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organizations_slug" ON "organizations"("slug")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organizations_active" ON "organizations"("is_active") WHERE "is_active" = TRUE`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_org_users_org_email" ON "org_users"("organization_id", "email")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_org_users_active" ON "org_users"("organization_id", "is_active") WHERE "is_active" = TRUE`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_events_org_time" ON "events"("organization_id", "start_time")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_events_type_status" ON "events"("organization_id", "type", "status")`);

        // ============================================================================
        // ROW LEVEL SECURITY POLICIES
        // ============================================================================

        // Enable RLS on tenant-scoped tables
        await queryRunner.query(`ALTER TABLE "org_users" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "org_user_roles" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "resources" ENABLE ROW LEVEL SECURITY`);
        await queryRunner.query(`ALTER TABLE "events" ENABLE ROW LEVEL SECURITY`);

        // Create RLS policies for tenant isolation
        await queryRunner.query(`DROP POLICY IF EXISTS "tenant_isolation_org_users" ON "org_users"`);
        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_org_users" ON "org_users"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`DROP POLICY IF EXISTS "tenant_isolation_roles" ON "roles"`);
        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_roles" ON "roles"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`DROP POLICY IF EXISTS "tenant_isolation_permissions" ON "permissions"`);
        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_permissions" ON "permissions"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_role_permissions" ON "role_permissions"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_org_user_roles" ON "org_user_roles"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_resources" ON "resources"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        await queryRunner.query(`
            CREATE POLICY "tenant_isolation_events" ON "events"
            FOR ALL USING ("organization_id"::text = current_setting('app.tenant_id', true))
        `);

        // ============================================================================
        // TRIGGERS FOR UPDATED_AT TIMESTAMPS
        // ============================================================================

        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

        // Apply to tables with updated_at columns
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_global_users_updated_at" BEFORE UPDATE ON "global_users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_organization_features_updated_at" BEFORE UPDATE ON "organization_features" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_org_users_updated_at" BEFORE UPDATE ON "org_users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_roles_updated_at" BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_resources_updated_at" BEFORE UPDATE ON "resources" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
        await queryRunner.query(`CREATE OR REPLACE TRIGGER "update_events_updated_at" BEFORE UPDATE ON "events" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key dependencies
        await queryRunner.query(`DROP TABLE IF EXISTS "events" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "resources" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "org_user_roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "org_users" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organization_features" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organization_admins" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organizations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "global_users" CASCADE`);

        // Drop function
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

        // Drop extensions
        await queryRunner.query(`DROP EXTENSION IF EXISTS "pgcrypto"`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }

}
