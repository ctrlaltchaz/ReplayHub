import { z } from 'zod';

// Base stats that all games might have
const baseStatsSchema = z.object({
    playtime: z.number().min(0).optional(), // seconds played
    notes: z.string().max(500).optional(),
});

// VALORANT-specific stats
export const valorantStatsSchema = baseStatsSchema.extend({
    // Core stats
    kills: z.number().min(0).default(0),
    deaths: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),

    // Objective stats
    plants: z.number().min(0).default(0),
    defuses: z.number().min(0).default(0),
    firstKills: z.number().min(0).default(0),
    firstDeaths: z.number().min(0).default(0),

    // Performance stats
    aces: z.number().min(0).default(0),
    clutches: z.number().min(0).default(0),
    multikills: z.number().min(0).default(0),

    // Combat stats
    headshotPct: z.number().min(0).max(100).optional(),
    adr: z.number().min(0).optional(), // average damage per round
    kast: z.number().min(0).max(100).optional(), // kill/assist/survive/trade percentage

    // Agent-specific (optional)
    agent: z.string().max(50).optional(),
    abilityKills: z.number().min(0).default(0),
    ultimateKills: z.number().min(0).default(0),
});

// League of Legends stats
export const lolStatsSchema = baseStatsSchema.extend({
    // Core KDA
    kills: z.number().min(0).default(0),
    deaths: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),

    // Farm stats
    cs: z.number().min(0).default(0), // creep score
    gold: z.number().min(0).default(0),
    level: z.number().min(1).max(18).default(1),

    // Combat stats
    damage: z.number().min(0).default(0), // total damage to champions
    damageTaken: z.number().min(0).default(0),
    healing: z.number().min(0).default(0),

    // Objective stats
    wards: z.number().min(0).default(0),
    wardsDestroyed: z.number().min(0).default(0),
    visionScore: z.number().min(0).default(0),

    // Champion-specific
    champion: z.string().max(50).optional(),
    role: z.enum(['top', 'jungle', 'mid', 'adc', 'support']).optional(),

    // Items (item IDs or names)
    items: z.array(z.string()).max(6).default([]),

    // Performance metrics
    kp: z.number().min(0).max(100).optional(), // kill participation
    csPerMin: z.number().min(0).optional(),
    goldPerMin: z.number().min(0).optional(),
});

// Overwatch 2 stats
export const ow2StatsSchema = baseStatsSchema.extend({
    // Core stats
    eliminations: z.number().min(0).default(0),
    deaths: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),

    // Combat stats
    damage: z.number().min(0).default(0),
    damageMitigated: z.number().min(0).default(0),
    healing: z.number().min(0).default(0),

    // Objective stats
    objectiveKills: z.number().min(0).default(0),
    objectiveTime: z.number().min(0).default(0), // seconds

    // Ultimate stats
    ults: z.number().min(0).default(0), // ultimates used
    ultKills: z.number().min(0).default(0),

    // Hero-specific
    hero: z.string().max(50).optional(),
    heroRole: z.enum(['tank', 'damage', 'support']).optional(),

    // Performance metrics
    elims_per_10min: z.number().min(0).optional(),
    damage_per_10min: z.number().min(0).optional(),
    healing_per_10min: z.number().min(0).optional(),

    // Role-specific stats (optional)
    criticalHits: z.number().min(0).default(0),
    accuracy: z.number().min(0).max(100).optional(),
});

// Rocket League stats
export const rlStatsSchema = baseStatsSchema.extend({
    // Core stats
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
    saves: z.number().min(0).default(0),

    // Offensive stats
    shots: z.number().min(0).default(0),
    shotsOnGoal: z.number().min(0).default(0),

    // Defensive stats
    demos: z.number().min(0).default(0), // demolitions
    epicSaves: z.number().min(0).default(0),

    // Boost usage
    boostUsage: z.number().min(0).optional(),
    boostEfficiency: z.number().min(0).max(100).optional(),

    // Performance metrics
    score: z.number().min(0).default(0), // in-game score
    mvps: z.number().min(0).default(0), // number of MVP awards in this match

    // Positioning stats (optional)
    timeInOffensiveHalf: z.number().min(0).optional(), // seconds
    timeInDefensiveHalf: z.number().min(0).optional(), // seconds

    // Advanced stats (optional)
    ballTouches: z.number().min(0).default(0),
    possessionTime: z.number().min(0).optional(), // seconds
});

// Generic/Other game stats (flexible schema)
export const genericStatsSchema = baseStatsSchema.extend({
    // Common FPS/MOBA stats (optional to support various games)
    kills: z.number().min(0).optional(),
    deaths: z.number().min(0).optional(),
    assists: z.number().min(0).optional(),
    damage: z.number().min(0).optional(),
    healing: z.number().min(0).optional(),

    // Basic performance
    score: z.number().min(0).default(0),
    rank: z.number().min(1).optional(), // finishing position

    // Allow any additional numeric stats
    customStats: z.record(z.string(), z.number()).default({}),

    // Allow any additional string metadata
    customMeta: z.record(z.string(), z.string()).default({}),
});

// Stats schema factory based on game title
export const getStatsSchema = (gameTitle: string) => {
    const normalizedTitle = gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    switch (normalizedTitle) {
        case 'valorant':
        case 'val':
            return valorantStatsSchema;

        case 'leagueoflegends':
        case 'lol':
        case 'league':
            return lolStatsSchema;

        case 'overwatch2':
        case 'overwatch':
        case 'ow2':
        case 'ow':
            return ow2StatsSchema;

        case 'rocketleague':
        case 'rl':
            return rlStatsSchema;

        default:
            return genericStatsSchema;
    }
};

// Validation function for stats JSON
export const validateStatsJson = (gameTitle: string, statsJson: unknown) => {
    const schema = getStatsSchema(gameTitle);
    return schema.parse(statsJson);
};

// Get expected fields for a game (for UI hints)
export const getExpectedStatsFields = (gameTitle: string): string[] => {
    const normalizedTitle = gameTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    switch (normalizedTitle) {
        case 'valorant':
        case 'val':
            return ['kills', 'deaths', 'assists', 'plants', 'defuses', 'firstKills', 'aces', 'adr', 'agent'];

        case 'leagueoflegends':
        case 'lol':
        case 'league':
            return ['kills', 'deaths', 'assists', 'cs', 'gold', 'damage', 'wards', 'champion', 'role'];

        case 'overwatch2':
        case 'overwatch':
        case 'ow2':
        case 'ow':
            return ['eliminations', 'deaths', 'assists', 'damage', 'healing', 'objectiveKills', 'hero', 'heroRole'];

        case 'rocketleague':
        case 'rl':
            return ['goals', 'assists', 'saves', 'shots', 'demos', 'score', 'boostUsage'];

        default:
            return ['score', 'rank'];
    }
};

// Type exports for TypeScript usage
export type ValorantStats = z.infer<typeof valorantStatsSchema>;
export type LoLStats = z.infer<typeof lolStatsSchema>;
export type OW2Stats = z.infer<typeof ow2StatsSchema>;
export type RLStats = z.infer<typeof rlStatsSchema>;
export type GenericStats = z.infer<typeof genericStatsSchema>;
export type GameStats = ValorantStats | LoLStats | OW2Stats | RLStats | GenericStats;