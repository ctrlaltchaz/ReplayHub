-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "captain_id" TEXT;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_captain_id_fkey" FOREIGN KEY ("captain_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
