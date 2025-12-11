import { getGameHeroes, getGameRoles } from './game-roles-heroes';

// Game-specific stat field configurations
export interface StatField {
    key: string;
    label: string;
    type: 'number' | 'text' | 'select';
    required?: boolean;
    min?: number;
    max?: number;
    options?: string[];
    placeholder?: string;
}

export const GAME_STAT_FIELDS: Record<string, StatField[]> = {
    "Valorant": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('Valorant') },
        { key: 'agent', label: 'Agent', type: 'select', options: getGameHeroes('Valorant') },
        { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0, max: 99 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0, max: 99 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0, max: 99 },
        { key: 'combatScore', label: 'Combat Score', type: 'number', min: 0 },
        { key: 'firstBloods', label: 'First Bloods', type: 'number', min: 0 },
    ],
    "Counter-Strike 2": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('Counter-Strike 2') },
        { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0, max: 99 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0, max: 99 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0, max: 99 },
        { key: 'adr', label: 'ADR (Avg Damage)', type: 'number', min: 0 },
        { key: 'headshots', label: 'Headshot %', type: 'number', min: 0, max: 100 },
    ],
    "League of Legends": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('League of Legends') },
        { key: 'champion', label: 'Champion', type: 'select', options: getGameHeroes('League of Legends') },
        { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0, max: 99 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0, max: 99 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0, max: 99 },
        { key: 'cs', label: 'CS (Creep Score)', type: 'number', min: 0 },
        { key: 'damage', label: 'Damage Dealt', type: 'number', min: 0 },
    ],
    "Dota 2": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('Dota 2') },
        { key: 'hero', label: 'Hero', type: 'select', options: getGameHeroes('Dota 2') },
        { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0, max: 99 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0, max: 99 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0, max: 99 },
        { key: 'netWorth', label: 'Net Worth', type: 'number', min: 0 },
        { key: 'damage', label: 'Hero Damage', type: 'number', min: 0 },
    ],
    "Overwatch": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('Overwatch') },
        { key: 'hero', label: 'Hero', type: 'select', options: getGameHeroes('Overwatch') },
        { key: 'eliminations', label: 'Eliminations', type: 'number', required: true, min: 0 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0 },
        { key: 'damage', label: 'Damage Dealt', type: 'number', min: 0 },
        { key: 'healing', label: 'Healing Done', type: 'number', min: 0 },
    ],
    "Rocket League": [
        { key: 'role', label: 'Position', type: 'select', options: getGameRoles('Rocket League') },
        { key: 'goals', label: 'Goals', type: 'number', required: true, min: 0 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0 },
        { key: 'saves', label: 'Saves', type: 'number', min: 0 },
        { key: 'shots', label: 'Shots', type: 'number', min: 0 },
        { key: 'score', label: 'Score', type: 'number', min: 0 },
    ],
    "Apex Legends": [
        { key: 'role', label: 'Role', type: 'select', options: getGameRoles('Apex Legends') },
        { key: 'legend', label: 'Legend', type: 'select', options: getGameHeroes('Apex Legends') },
        { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0 },
        { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0 },
        { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0 },
        { key: 'damage', label: 'Damage Dealt', type: 'number', min: 0 },
        { key: 'revives', label: 'Revives', type: 'number', min: 0 },
    ],
};

// Default stat fields for unknown games
export const DEFAULT_STAT_FIELDS: StatField[] = [
    { key: 'role', label: 'Role/Position', type: 'text' },
    { key: 'kills', label: 'Kills', type: 'number', required: true, min: 0 },
    { key: 'deaths', label: 'Deaths', type: 'number', required: true, min: 0 },
    { key: 'assists', label: 'Assists', type: 'number', required: true, min: 0 },
    { key: 'damage', label: 'Damage', type: 'number', min: 0 },
];

export function getGameStatFields(game?: string): StatField[] {
    if (!game) return DEFAULT_STAT_FIELDS;
    return GAME_STAT_FIELDS[game] || DEFAULT_STAT_FIELDS;
}

// Helper to calculate KDA ratio
export function calculateKDA(kills: number, deaths: number, assists: number): string {
    if (deaths === 0) return `${kills + assists}.00`;
    const kda = (kills + assists) / deaths;
    return kda.toFixed(2);
}
