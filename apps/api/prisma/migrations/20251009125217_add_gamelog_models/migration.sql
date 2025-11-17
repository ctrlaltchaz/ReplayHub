-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT,
    "team_id" TEXT NOT NULL,
    "lineup_id" TEXT,
    "opponent" TEXT NOT NULL,
    "tournament" TEXT,
    "stage" TEXT,
    "bestOf" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "result" TEXT,
    "score" TEXT,
    "vod_url" TEXT,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_games" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mapName" TEXT,
    "gameIdx" INTEGER NOT NULL,
    "our_score" INTEGER NOT NULL DEFAULT 0,
    "their_score" INTEGER NOT NULL DEFAULT 0,
    "duration_sec" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "map_game_id" TEXT,
    "player_id" TEXT NOT NULL,
    "org_user_id" TEXT,
    "lineup_id" TEXT,
    "role" TEXT,
    "stats_json" JSONB NOT NULL,
    "rating" DOUBLE PRECISION,
    "is_mvp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_tenant_id_team_id_startedAt_idx" ON "matches"("tenant_id", "team_id", "startedAt");

-- CreateIndex
CREATE INDEX "map_games_tenant_id_match_id_idx" ON "map_games"("tenant_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_games_tenant_id_match_id_gameIdx_key" ON "map_games"("tenant_id", "match_id", "gameIdx");

-- CreateIndex
CREATE INDEX "player_stats_tenant_id_match_id_idx" ON "player_stats"("tenant_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_tenant_id_match_id_player_id_map_game_id_key" ON "player_stats"("tenant_id", "match_id", "player_id", "map_game_id");

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "lineups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "org_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_games" ADD CONSTRAINT "map_games_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_map_game_id_fkey" FOREIGN KEY ("map_game_id") REFERENCES "map_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_org_user_id_fkey" FOREIGN KEY ("org_user_id") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "lineups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
