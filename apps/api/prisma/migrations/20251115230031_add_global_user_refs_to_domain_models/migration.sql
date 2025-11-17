-- AlterTable
ALTER TABLE "events" ADD COLUMN     "created_by_global_user_id" TEXT,
ADD COLUMN     "production_lead_global_user_id" TEXT;

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "created_by_global_user_id" TEXT;

-- AlterTable
ALTER TABLE "player_stats" ADD COLUMN     "global_user_id" TEXT;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "global_user_id" TEXT;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "coach_global_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_coach_global_user_id_fkey" FOREIGN KEY ("coach_global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_global_user_id_fkey" FOREIGN KEY ("global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_created_by_global_user_id_fkey" FOREIGN KEY ("created_by_global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_global_user_id_fkey" FOREIGN KEY ("global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_global_user_id_fkey" FOREIGN KEY ("created_by_global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_production_lead_global_user_id_fkey" FOREIGN KEY ("production_lead_global_user_id") REFERENCES "global_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
