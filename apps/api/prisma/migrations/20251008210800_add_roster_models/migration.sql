-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "season" TEXT,
    "coach_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "org_user_id" TEXT,
    "gamer_tag" TEXT NOT NULL,
    "role" TEXT,
    "rank" TEXT,
    "mains_json" JSONB DEFAULT '[]',
    "bio" TEXT,
    "socials_json" JSONB DEFAULT '{}',
    "eligibility" TEXT,
    "consent_json" JSONB DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "is_starter" BOOLEAN NOT NULL DEFAULT false,
    "position" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineup_slots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "lineup_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "role" TEXT,
    "is_sub" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "idx" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lineup_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "team_id" TEXT,
    "player_id" TEXT,
    "title" TEXT NOT NULL,
    "event_ref" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teams_tenant_id_idx" ON "teams"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_tenant_id_name_season_key" ON "teams"("tenant_id", "name", "season");

-- CreateIndex
CREATE INDEX "players_tenant_id_idx" ON "players"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_tenant_id_gamer_tag_key" ON "players"("tenant_id", "gamer_tag");

-- CreateIndex
CREATE INDEX "team_members_tenant_id_team_id_idx" ON "team_members"("tenant_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_tenant_id_team_id_player_id_key" ON "team_members"("tenant_id", "team_id", "player_id");

-- CreateIndex
CREATE INDEX "availability_tenant_id_date_idx" ON "availability"("tenant_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "availability_tenant_id_player_id_date_key" ON "availability"("tenant_id", "player_id", "date");

-- CreateIndex
CREATE INDEX "lineups_tenant_id_team_id_idx" ON "lineups"("tenant_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "lineups_tenant_id_event_id_key" ON "lineups"("tenant_id", "event_id");

-- CreateIndex
CREATE INDEX "lineup_slots_tenant_id_lineup_id_idx" ON "lineup_slots"("tenant_id", "lineup_id");

-- CreateIndex
CREATE UNIQUE INDEX "lineup_slots_tenant_id_lineup_id_player_id_key" ON "lineup_slots"("tenant_id", "lineup_id", "player_id");

-- CreateIndex
CREATE INDEX "achievements_tenant_id_date_idx" ON "achievements"("tenant_id", "date");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_org_user_id_fkey" FOREIGN KEY ("org_user_id") REFERENCES "org_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineup_slots" ADD CONSTRAINT "lineup_slots_lineup_id_fkey" FOREIGN KEY ("lineup_id") REFERENCES "lineups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineup_slots" ADD CONSTRAINT "lineup_slots_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
