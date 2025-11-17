import { getExpectedStatsFields, validateStatsJson, ValorantStats } from '../validators/game-stats.validator';

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
            headshotPct: 65,
            adr: 156.8,
            kast: 78,
            agent: 'Jett',
            abilityKills: 2,
            ultimateKills: 4,
        };

        it('should validate correct VALORANT stats', () => {
            const result = validateStatsJson('VALORANT', validValorantStats);
            expect(result).toMatchObject({
                kills: 24,
                headshotPct: 65,
                kast: 78,
            });
        });

        it('should reject VALORANT stats with invalid types', () => {
            const invalidStats = {
                ...validValorantStats,
                kills: 'invalid', // should be number
                agent: 123, // should be string
            };

            expect(() => validateStatsJson('VALORANT', invalidStats)).toThrow();
        });

        it('should reject VALORANT stats with negative values', () => {
            const invalidStats = {
                ...validValorantStats,
                kills: -5,
                deaths: -2,
            };

            expect(() => validateStatsJson('VALORANT', invalidStats)).toThrow();
        });

        it('should reject VALORANT stats with percentage out of range', () => {
            const invalidStats = {
                ...validValorantStats,
                headshotPct: 150, // should be 0-100
                kast: -10, // should be 0-100
            };

            expect(() => validateStatsJson('VALORANT', invalidStats)).toThrow();
        });

        it('should accept VALORANT stats with extra valid fields', () => {
            const statsWithExtra = {
                ...validValorantStats,
                extraField: 'allowed',
            };

            const result = validateStatsJson('VALORANT', statsWithExtra) as ValorantStats;
            expect(result.kills).toBe(24);
            expect((result as Record<string, unknown>).extraField).toBeUndefined();
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
            role: 'adc',
            kp: 85,
            csPerMin: 8.2,
            goldPerMin: 550,
        };

        it('should validate correct League of Legends stats', () => {
            const result = validateStatsJson('League of Legends', validLoLStats);
            expect(result).toMatchObject({
                champion: 'Jinx',
                role: 'adc',
                kp: 85,
            });
        });

        it('should reject LoL stats with invalid champion name', () => {
            const invalidStats = {
                ...validLoLStats,
                champion: '', // empty string not allowed
            };

            expect(() => validateStatsJson('League of Legends', invalidStats)).toThrow();
        });

        it('should validate LoL stats with minimum required fields', () => {
            const minimalStats = {
                kills: 5,
                deaths: 2,
                assists: 8,
                cs: 120,
                champion: 'Yasuo',
            };

            const result = validateStatsJson('LoL', minimalStats);
            expect(result).toMatchObject({ kills: 5, cs: 120 });
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
            heroRole: 'damage',
            elims_per_10min: 18.5,
            damage_per_10min: 8200,
            healing_per_10min: 6500,
            criticalHits: 45,
            accuracy: 72,
        };

        it('should validate correct Overwatch 2 stats', () => {
            const result = validateStatsJson('Overwatch 2', validOW2Stats);
            expect(result).toMatchObject({ heroRole: 'damage', accuracy: 72 });
        });

        it('should reject OW2 stats with invalid hero role', () => {
            const invalidStats = {
                ...validOW2Stats,
                heroRole: 'InvalidRole', // should be Tank, DPS, or Support
            };

            expect(() => validateStatsJson('Overwatch 2', invalidStats)).toThrow();
        });

        it('should validate OW2 stats with alternative game title', () => {
            const result = validateStatsJson('OW2', validOW2Stats);
            expect(result).toMatchObject({ eliminations: 35 });
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
            const result = validateStatsJson('Rocket League', validRLStats);
            expect(result).toMatchObject({ goals: 3, score: 650 });
        });

        it('should reject RL stats with efficiency values out of range', () => {
            const invalidStats = {
                ...validRLStats,
                boostUsage: -0.5, // should be >= 0
                boostEfficiency: 150, // should be <= 100
            };

            expect(() => validateStatsJson('Rocket League', invalidStats)).toThrow();
        });

        it('should validate RL stats with shortened game title', () => {
            const result = validateStatsJson('RL', validRLStats);
            expect(result).toMatchObject({ saves: 5 });
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

            const result = validateStatsJson('Unknown Game', genericStats);
            expect(result).toMatchObject({ score: 1500 });
        });

        it('should reject null or undefined stats', () => {
            expect(() => validateStatsJson('VALORANT', null)).toThrow();
            expect(() => validateStatsJson('VALORANT', undefined)).toThrow();
        });

        it('should reject non-object stats', () => {
            expect(() => validateStatsJson('VALORANT', 'invalid')).toThrow();
            expect(() => validateStatsJson('VALORANT', 123)).toThrow();
            expect(() => validateStatsJson('VALORANT', [])).toThrow();
        });
    });

    describe('Expected Fields Helper', () => {
        it('should return VALORANT expected fields', () => {
            const fields = getExpectedStatsFields('VALORANT');
            expect(fields).toContain('kills');
            expect(fields).toContain('deaths');
            expect(fields).toContain('assists');
            expect(fields).toContain('agent');
            expect(fields).toContain('adr');
        });

        it('should return League of Legends expected fields', () => {
            const fields = getExpectedStatsFields('League of Legends');
            expect(fields).toContain('kills');
            expect(fields).toContain('deaths');
            expect(fields).toContain('assists');
            expect(fields).toContain('cs');
            expect(fields).toContain('champion');
        });

        it('should return Overwatch 2 expected fields', () => {
            const fields = getExpectedStatsFields('Overwatch 2');
            expect(fields).toContain('eliminations');
            expect(fields).toContain('deaths');
            expect(fields).toContain('hero');
            expect(fields).toContain('heroRole');
        });

        it('should return Rocket League expected fields', () => {
            const fields = getExpectedStatsFields('Rocket League');
            expect(fields).toContain('goals');
            expect(fields).toContain('assists');
            expect(fields).toContain('saves');
            expect(fields).toContain('score');
        });

        it('should return basic fields for unknown games', () => {
            const fields = getExpectedStatsFields('Unknown Game');
            expect(fields).toContain('score');
            expect(fields).toContain('rank');
        });

        it('should handle case insensitive game titles', () => {
            const fieldsUpper = getExpectedStatsFields('VALORANT');
            const fieldsLower = getExpectedStatsFields('valorant');
            const fieldsMixed = getExpectedStatsFields('VaLoRaNt');

            expect(fieldsUpper).toEqual(fieldsLower);
            expect(fieldsLower).toEqual(fieldsMixed);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty stats object', () => {
            const result = validateStatsJson('VALORANT', {}) as ValorantStats;
            expect(result.kills).toBe(0); // Defaults applied
        });

        it('should handle partial stats', () => {
            const partialStats = {
                kills: 10,
                deaths: 5,
                // missing other fields
            };

            const result = validateStatsJson('VALORANT', partialStats);
            expect(result).toMatchObject({ kills: 10, deaths: 5 });
        });

        it('should handle nested objects in generic validation', () => {
            const nestedStats = {
                basic: { kills: 10, deaths: 5 },
                advanced: { rating: 1.5, tier: 'Gold' },
            };

            expect(() => validateStatsJson('Custom Game', nestedStats)).not.toThrow();
        });

        it('should preserve original data in successful validation', () => {
            const originalStats = {
                kills: 15,
                deaths: 8,
                agent: 'Sage',
            };

            const result = validateStatsJson('VALORANT', originalStats);
            expect(result).toMatchObject(originalStats);
        });
    });
});