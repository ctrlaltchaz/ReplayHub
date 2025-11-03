import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifiedSchema1759876044807 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Global Users table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "global_users" (
                "id" VARCHAR PRIMARY KEY,
                "email" VARCHAR UNIQUE NOT NULL,
                "password_hash" VARCHAR NOT NULL,
                "totp_secret" VARCHAR,
                "is_totp_enabled" BOOLEAN DEFAULT false,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Organizations table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organisations" (
                "id" VARCHAR PRIMARY KEY,
                "slug" VARCHAR UNIQUE NOT NULL,
                "name" VARCHAR NOT NULL,
                "branding_json" JSONB DEFAULT '{}',
                "features_json" JSONB DEFAULT '{}',
                "owner_id" VARCHAR NOT NULL,
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                "updated_at" TIMESTAMPTZ DEFAULT NOW(),
                FOREIGN KEY ("owner_id") REFERENCES "global_users"("id") ON DELETE CASCADE
            )
        `);

        // Organisation Admins table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organisation_admins" (
                "id" VARCHAR PRIMARY KEY,
                "organisation_id" VARCHAR NOT NULL,
                "global_user_id" VARCHAR NOT NULL,
                "role" VARCHAR DEFAULT 'owner',
                "created_at" TIMESTAMPTZ DEFAULT NOW(),
                FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE,
                FOREIGN KEY ("global_user_id") REFERENCES "global_users"("id") ON DELETE CASCADE,
                UNIQUE("organisation_id", "global_user_id")
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_global_users_email" ON "global_users"("email")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organisations_slug" ON "organisations"("slug")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organisations_owner" ON "organisations"("owner_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organisation_admins_org" ON "organisation_admins"("organisation_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_organisation_admins_user" ON "organisation_admins"("global_user_id")`);

        // Create trigger for updated_at timestamps
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);

        await queryRunner.query(`
            CREATE OR REPLACE TRIGGER update_global_users_updated_at 
            BEFORE UPDATE ON "global_users" 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

        await queryRunner.query(`
            CREATE OR REPLACE TRIGGER update_organisations_updated_at 
            BEFORE UPDATE ON "organisations" 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key dependencies
        await queryRunner.query(`DROP TABLE IF EXISTS "organisation_admins" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organisations" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "global_users" CASCADE`);

        // Drop function
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);
    }

}
