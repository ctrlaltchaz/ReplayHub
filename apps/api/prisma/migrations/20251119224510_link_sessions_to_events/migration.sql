-- DropForeignKey
ALTER TABLE "public"."production_sessions" DROP CONSTRAINT "production_sessions_tenant_id_fkey";

-- AlterTable
ALTER TABLE "production_sessions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "production_sessions" ADD CONSTRAINT "production_sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
