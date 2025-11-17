-- AlterTable
ALTER TABLE "org_users" ADD COLUMN     "global_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "org_users" ADD CONSTRAINT "org_users_global_user_id_fkey" FOREIGN KEY ("global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
