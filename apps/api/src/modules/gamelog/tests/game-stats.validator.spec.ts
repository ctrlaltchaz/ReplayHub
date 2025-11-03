import { getExpectedFields, validateStatsJson } from '../validators/game-stats.validator';

describe('Game Stats Validator', () => {
    describe('VALORANT Stats Validation', () => {
        const validValorantStats = {
            kills: 24,
            deaths: 15,
            assists: 8,
            plants: 3,
            defuses: 1,
            firstKills: 5,
            firstDeaths: 2,
            aces: 1,
            clutches: 2,
            multikills: 3,
            headshotPct: 0.65,
            adr: 156.8,
            kast: 0.78,
            agent: 'Jett',
            abilityKills: 2,
            ultimateKills: 4,
        };

        it('should validate correct VALORANT stats', () => {
            const result = validateStatsJson(validValorantStats, 'VALORANT');
            expect(result.success).toBe(true);
        });

        it('should reject VALORANT stats with invalid types', () => {
            const invalidStats = {
                ...validValorantStats,
                kills: 'invalid', // should be number
                agent: 123, // should be string
            };

            const result = validateStatsJson(invalidStats, 'VALORANT');
            expect(result.success).toBe(false);
            expect(result.error?.issues).toHaveLength(2);
        });

        it('should reject VALORANT stats with negative values', () => {
            const invalidStats = {
                ...validValorantStats,
                kills: -5,
                deaths: -2,
            };

            const result = validateStatsJson(invalidStats, 'VALORANT');
            expect(result.success).toBe(false);
        });

        it('should reject VALORANT stats with percentage out of range', () => {
            const invalidStats = {
                ...validValorantStats,
                headshotPct: 1.5, // should be 0-1
                kast: -0.1, // should be 0-1
            };

            const result = validateStatsJson(invalidStats, 'VALORANT');
            expect(result.success).toBe(false);
        });

        it('should accept VALORANT stats with extra valid fields', () => {
            const statsWithExtra = {
                ...validValorantStats,
                extraField: 'allowed',
            };

            const result = validateStatsJson(statsWithExtra, 'VALORANT');
            expect(result.success).toBe(true);
        });
    });

    describe('League of Legends Stats Validation', () => {
        const validLoLStats = {
            kills: 12,
            deaths: 3,
            assists: 18,
            cs: 185,
            gold: 12500,
            level: 16,
            damage: 25000,
            damageTaken: 18000,
            healing: 2500,
            wards: 15,
            wardsDestroyed: 8,
            visionScore: 45,
            champion: 'Jinx',
            role: 'ADC',
            kp: 0.85,
            csPerMin: 8.2,
            goldPerMin: 550,
        };

        it('should validate correct League of Legends stats', () => {
            const result = validateStatsJson(validLoLStats, 'League of Legends');
            expect(result.success).toBe(true);
        });

        it('should reject LoL stats with invalid champion name', () => {
            const invalidStats = {
                ...validLoLStats,
                champion: '', // empty string not allowed
            };

            const result = validateStatsJson(invalidStats, 'League of Legends');
            expect(result.success).toBe(false);
        });

        it('should validate LoL stats with minimum required fields', () => {
            const minimalStats = {
                kills: 5,
                deaths: 2,
                assists: 8,
                cs: 120,
                champion: 'Yasuo',
            };

            const result = validateStatsJson(minimalStats, 'LoL');
            expect(result.success).toBe(true);
        });
    });

    describe('Overwatch 2 Stats Validation', () => {
        const validOW2Stats = {
            eliminations: 35,
            deaths: 8,
            assists: 12,
            damage: 15000,
            damageMitigated: 8500,
            healing: 12000,
            objectiveKills: 8,
            objectiveTime: 120,
            ults: 6,
            ultKills: 15,
            hero: 'Tracer',
            heroRole: 'DPS',
            elims_per_10min: 18.5,
            damage_per_10min: 8200,
            healing_per_10min: 6500,
            criticalHits: 45,
            accuracy: 0.72,
        };

        it('should validate correct Overwatch 2 stats', () => {
            const result = validateStatsJson(validOW2Stats, 'Overwatch 2');
            expect(result.success).toBe(true);
        });

        it('should reject OW2 stats with invalid hero role', () => {
            const invalidStats = {
                ...validOW2Stats,
                heroRole: 'InvalidRole', // should be Tank, DPS, or Support
            };

            const result = validateStatsJson(invalidStats, 'Overwatch 2');
            expect(result.success).toBe(false);
        });

        it('should validate OW2 stats with alternative game title', () => {
            const result = validateStatsJson(validOW2Stats, 'OW2');
            expect(result.success).toBe(true);
        });
    });

    describe('Rocket League Stats Validation', () => {
        const validRLStats = {
            goals: 3,
            assists: 2,
            saves: 5,
            shots: 8,
            shotsOnGoal: 5,
            demos: 2,
            epicSaves: 1,
            boostUsage: 0.85,
            boostEfficiency: 0.72,
            score: 650,
            mvps: 1,
            ballTouches: 45,
            possessionTime: 120,
        };

        it('should validate correct Rocket League stats', () => {
            const result = validateStatsJson(validRLStats, 'Rocket League');
            expect(result.success).toBe(true);
        });

        it('should reject RL stats with efficiency values out of range', () => {
            const invalidStats = {
                ...validRLStats,
                boostUsage: 1.2, // should be 0-1
                boostEfficiency: -0.1, // should be 0-1
            };

            const result = validateStatsJson(invalidStats, 'Rocket League');
            expect(result.success).toBe(false);
        });

        it('should validate RL stats with shortened game title', () => {
            const result = validateStatsJson(validRLStats, 'RL');
            expect(result.success).toBe(true);
        });
    });

    describe('Generic Game Stats Validation', () => {
        it('should accept any valid JSON for unknown game titles', () => {
            const genericStats = {
                score: 1500,
                rank: 'Gold',
                customMetric: 42.5,
                booleanFlag: true,
                stringValue: 'test',
            };

            const result = validateStatsJson(genericStats, 'Unknown Game');
            expect(result.success).toBe(true);
        });

        it('should reject null or undefined stats', () => {
            expect(validateStatsJson(null, 'VALORANT').success).toBe(false);
            expect(validateStatsJson(undefined, 'VALORANT').success).toBe(false);
        });

        it('should reject non-object stats', () => {
            expect(validateStatsJson('invalid', 'VALORANT').success).toBe(false);
            expect(validateStatsJson(123, 'VALORANT').success).toBe(false);
            expect(validateStatsJson([], 'VALORANT').success).toBe(false);
        });
    });

    describe('Expected Fields Helper', () => {
        it('should return VALORANT expected fields', () => {
            const fields = getExpectedFields('VALORANT');
            expect(fields).toContain('kills');
            expect(fields).toContain('deaths');
            expect(fields).toContain('assists');
            expect(fields).toContain('agent');
            expect(fields).toContain('adr');
        });

        it('should return League of Legends expected fields', () => {
            const fields = getExpectedFields('League of Legends');
            expect(fields).toContain('kills');
            expect(fields).toContain('deaths');
            expect(fields).toContain('assists');
            expect(fields).toContain('cs');
            expect(fields).toContain('champion');
        });

        it('should return Overwatch 2 expected fields', () => {
            const fields = getExpectedFields('Overwatch 2');
            expect(fields).toContain('eliminations');
            expect(fields).toContain('deaths');
            expect(fields).toContain('hero');
            expect(fields).toContain('heroRole');
        });

        it('should return Rocket League expected fields', () => {
            const fields = getExpectedFields('Rocket League');
            expect(fields).toContain('goals');
            expect(fields).toContain('assists');
            expect(fields).toContain('saves');
            expect(fields).toContain('score');
        });

        it('should return basic fields for unknown games', () => {
            const fields = getExpectedFields('Unknown Game');
            expect(fields).toContain('score');
            expect(fields).toContain('rank');
        });

        it('should handle case insensitive game titles', () => {
            const fieldsUpper = getExpectedFields('VALORANT');
            const fieldsLower = getExpectedFields('valorant');
            const fieldsMixed = getExpectedFields('VaLoRaNt');

            expect(fieldsUpper).toEqual(fieldsLower);
            expect(fieldsLower).toEqual(fieldsMixed);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty stats object', () => {
            const result = validateStatsJson({}, 'VALORANT');
            expect(result.success).toBe(true); // Empty object is valid
        });

        it('should handle partial stats', () => {
            const partialStats = {
                kills: 10,
                deaths: 5,
                // missing other fields
            };

            const result = validateStatsJson(partialStats, 'VALORANT');
            expect(result.success).toBe(true); // Partial stats are valid
        });

        it('should handle nested objects in generic validation', () => {
            const nestedStats = {
                basic: { kills: 10, deaths: 5 },
                advanced: { rating: 1.5, tier: 'Gold' },
            };

            const result = validateStatsJson(nestedStats, 'Custom Game');
            expect(result.success).toBe(true);
        });

        it('should preserve original data in successful validation', () => {
            const originalStats = {
                kills: 15,
                deaths: 8,
                agent: 'Sage',
            };

            const result = validateStatsJson(originalStats, 'VALORANT');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(originalStats);
            }
        });
    });
});