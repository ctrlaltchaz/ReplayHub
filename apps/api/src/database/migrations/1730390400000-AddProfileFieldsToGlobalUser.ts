import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileFieldsToGlobalUser1730390400000 implements MigrationInterface {
    name = 'AddProfileFieldsToGlobalUser1730390400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "global_users" 
            ADD COLUMN "bio" TEXT,
            ADD COLUMN "location" VARCHAR(255),
            ADD COLUMN "timezone" VARCHAR(100),
            ADD COLUMN "social_links" JSONB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "global_users" 
            DROP COLUMN "bio",
            DROP COLUMN "location",
            DROP COLUMN "timezone",
            DROP COLUMN "social_links"
        `);
    }
}
