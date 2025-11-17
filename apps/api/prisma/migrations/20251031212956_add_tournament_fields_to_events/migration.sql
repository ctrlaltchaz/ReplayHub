-- AlterTable
ALTER TABLE "events" ADD COLUMN     "best_of" INTEGER DEFAULT 1,
ADD COLUMN     "opponent" TEXT,
ADD COLUMN     "tournament_name" TEXT,
ADD COLUMN     "tournament_stage" TEXT;
