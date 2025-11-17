/*
  Warnings:

  - You are about to drop the column `created_by` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `production_lead` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the column `org_user_id` on the `player_stats` table. All the data in the column will be lost.
  - You are about to drop the column `org_user_id` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `coach_id` on the `teams` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_production_lead_fkey";

-- DropForeignKey
ALTER TABLE "public"."matches" DROP CONSTRAINT "matches_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."player_stats" DROP CONSTRAINT "player_stats_org_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."players" DROP CONSTRAINT "players_org_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_coach_id_fkey";

-- DropIndex
DROP INDEX "public"."events_tenant_id_production_lead_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "created_by",
DROP COLUMN "production_lead";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "created_by";

-- AlterTable
ALTER TABLE "player_stats" DROP COLUMN "org_user_id";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "org_user_id";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "coach_id";
