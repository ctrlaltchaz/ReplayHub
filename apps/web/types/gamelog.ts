// GameLog types based on the API schema

export type MatchStatus = "draft" | "submitted" | "approved";
export type MatchResult = "win" | "loss" | "draw" | "forfeit";

export interface Match {
  id: string;
  tenantId: string;
  eventId?: string;
  teamId: string;
  lineupId?: string;
  opponent: string;
  tournament?: string;
  stage?: string;
  bestOf: number;
  startedAt?: string;
  endedAt?: string;
  status: MatchStatus;
  result?: MatchResult;
  score?: string;
  vodUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations
  team?: {
    id: string;
    name: string;
    game: string;
    mapPool?: string[];
  };
  lineup?: {
    id: string;
    title?: string;
  };
  maps?: MapGame[];
  playerStats?: PlayerStat[];
  playerStatsByRound?: PlayerStat[];
}

export interface MapGame {
  id: string;
  matchId: string;
  title: string;
  mapName?: string;
  gameIdx: number;
  ourScore: number;
  theirScore: number;
  durationSec?: number;
  notes?: string;
  createdAt?: string;
  playerStats?: PlayerStat[];
}

export interface PlayerStat {
  id: string;
  matchId: string;
  mapGameId?: string;
  playerId: string;
  playerName?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  damage?: number;
  healing?: number;
  rating?: number;
  isMvp?: boolean;
  statsJson?: Record<string, any>;
  mapGame?: {
    id: string;
    title: string;
    mapName?: string;
    gameIdx: number;
  };
  roundStats?: PlayerStat[];
  totalRounds?: number;
}

export interface MatchWithDetails extends Match {
  // Match already includes maps and playerStats, no need to override
}

export interface CreateMatchDto {
  eventId?: string;
  teamId: string;
  lineupId?: string;
  opponent: string;
  tournament?: string;
  stage?: string;
  bestOf?: number;
  startedAt?: string;
  endedAt?: string;
  vodUrl?: string;
  notes?: string;
  result?: MatchResult;
  score?: string;
}

export interface UpdateMatchDto {
  eventId?: string;
  teamId?: string;
  lineupId?: string;
  opponent?: string;
  tournament?: string;
  stage?: string;
  bestOf?: number;
  startedAt?: string;
  endedAt?: string;
  vodUrl?: string;
  status?: MatchStatus;
  result?: MatchResult;
  score?: string;
  notes?: string;
}

export interface CreateMapGameDto {
  title: string;
  mapName?: string;
  gameIdx: number;
  ourScore?: number;
  theirScore?: number;
  durationSec?: number;
  notes?: string;
}

export interface CreatePlayerStatDto {
  playerId: string;
  mapGameId?: string;
  kills?: number;
  deaths?: number;
  assists?: number;
  damage?: number;
  healing?: number;
  rating?: number;
  isMvp?: boolean;
  statsJson?: Record<string, any>;
}

export interface UpdatePlayerStatDto {
  mapGameId?: string;
  role?: string;
  rating?: number;
  isMvp?: boolean;
  statsJson?: Record<string, any>;
}

export interface MatchesQueryParams {
  teamId?: string;
  tournament?: string;
  status?: MatchStatus;
  result?: MatchResult;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
