import { Id } from './api';

export interface Team {
    id: Id;
    name: string;
    game: string;
    season?: string;
    mapPool?: string[]; // Custom map pool for this team
    coachId?: string;
    captainId?: string;
    status: 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
    members: TeamMember[];
    achievements?: Achievement[];
    captain?: Player;
    _count?: {
        members: number;
        lineups?: number;
        achievements?: number;
    };
}

export interface Player {
    id: Id;
    gamerTag: string;
    realName?: string;
    avatar?: string;
    globalUserId?: string;
    role?: string;
    rank?: string;
    mainsJson?: string[];
    bio?: string;
    socialsJson?: Record<string, string>;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
    isActive: boolean;
    statsVisible?: boolean;
    createdAt: string;
    updatedAt: string;
    teams?: TeamMember[];
    achievements?: Achievement[];
    globalUser?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface TeamMember {
    id: Id;
    teamId: string;
    playerId: string;
    isStarter: boolean;
    position?: string;
    createdAt: string;
    team?: Team;
    player?: Player;
}

export interface Achievement {
    id: Id;
    teamId?: string;
    playerId?: string;
    title: string;
    eventRef?: string;
    date: string;
    details?: string;
    createdAt: string;
    team?: Team;
    player?: Player;
}

export interface Availability {
    id: Id;
    playerId: string;
    date: string;
    status: 'available' | 'unsure' | 'unavailable';
    note?: string;
    createdAt: string;
    player?: Player;
}

// Query types
export interface TeamsQueryParams {
    game?: string;
    season?: string;
    status?: 'active' | 'archived';
    q?: string;
}

export interface PlayersQueryParams {
    q?: string;
    active?: boolean;
    teamId?: string;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
}

export interface AchievementsQueryParams {
    teamId?: string;
    playerId?: string;
    from?: string;
    to?: string;
}

export interface AvailabilityQueryParams {
    date: string;
    teamId?: string;
}

// DTOs
export interface CreateTeamDto {
    name: string;
    game: string;
    season?: string;
    mapPool?: string[];
    coachId?: string;
    captainId?: string;
}

export interface UpdateTeamDto {
    name?: string;
    game?: string;
    season?: string;
    mapPool?: string[];
    coachId?: string;
    captainId?: string;
    status?: 'active' | 'archived';
}

export interface CreatePlayerDto {
    gamerTag: string;
    realName?: string;
    orgUserId?: string;
    role?: string;
    rank?: string;
    mains?: string[];
    bio?: string;
    socials?: Record<string, string>;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
    consent?: Record<string, any>;
    teamId?: string;
}

export interface UpdatePlayerDto {
    gamerTag?: string;
    realName?: string;
    orgUserId?: string;
    role?: string;
    rank?: string;
    mains?: string[];
    bio?: string;
    socials?: Record<string, string>;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
    consent?: Record<string, any>;
    isActive?: boolean;
    teamId?: string;
}

export interface AddTeamMemberDto {
    playerId: string;
    isStarter?: boolean;
    position?: string;
}

export interface UpdateTeamMemberDto {
    isStarter?: boolean;
    position?: string;
}

export interface CreateAchievementDto {
    teamId?: string;
    playerId?: string;
    title: string;
    eventRef?: string;
    date: string;
    details?: string;
}

export interface SetAvailabilityDto {
    date: string;
    status: 'available' | 'unsure' | 'unavailable';
    note?: string;
}