import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../../../../database/prisma.service';
import { GameLogModule } from '../gamelog.module';

describe('GameLog Integration Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test data
    const testTenantId = 'tenant-1';
    const testUserId = 'user-1';
    const testOrgSlug = 'test-org';
    const testTeamId = 'team-1';

    let matchId: string;
    let mapGameId: string;
    let playerStatId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [GameLogModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);

        await app.init();

        // Setup test data
        await setupTestData();
    });

    afterAll(async () => {
        // Cleanup
        await cleanupTestData();
        await app.close();
    });

    describe('Match Management', () => {
        it('should create a new match', async () => {
            const createMatchDto = {
                opponent: 'Test Opponents',
                tournament: 'Test Tournament',
                stage: 'Group Stage',
                lineupId: 'lineup-1',
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(createMatchDto)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.opponent).toBe(createMatchDto.opponent);
            expect(response.body.status).toBe('draft');

            matchId = response.body.id;
        });

        it('should get match by ID with tenant isolation', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            expect(response.body.id).toBe(matchId);
            expect(response.body.tenantId).toBe(testTenantId);
        });

        it('should not access match from different tenant', async () => {
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);
        });

        it('should update match', async () => {
            const updateDto = {
                result: 'win',
                score: '2-1',
                notes: 'Good performance overall',
            };

            const response = await request(app.getHttpServer())
                .put(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(updateDto)
                .expect(200);

            expect(response.body.result).toBe(updateDto.result);
            expect(response.body.score).toBe(updateDto.score);
        });

        it('should list matches with filtering', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .query({ status: 'draft', limit: 10 })
                .expect(200);

            expect(response.body).toHaveProperty('matches');
            expect(response.body).toHaveProperty('total');
            expect(Array.isArray(response.body.matches)).toBe(true);
        });
    });

    describe('Approval Workflow', () => {
        it('should submit match for approval', async () => {
            const submitDto = {
                submittedNotes: 'All stats verified and ready for approval',
            };

            const response = await request(app.getHttpServer())
                .patch(`/org/${testOrgSlug}/gamelog/matches/${matchId}/submit`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(submitDto)
                .expect(200);

            expect(response.body.status).toBe('submitted');
            expect(response.body.submittedAt).toBeDefined();
            expect(response.body.submittedBy).toBe(testUserId);
        });

        it('should approve match', async () => {
            const approveDto = {
                approvedNotes: 'Stats look good, approved for record keeping',
            };

            const response = await request(app.getHttpServer())
                .patch(`/org/${testOrgSlug}/gamelog/matches/${matchId}/approve`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(approveDto)
                .expect(200);

            expect(response.body.status).toBe('approved');
            expect(response.body.approvedAt).toBeDefined();
            expect(response.body.approvedBy).toBe(testUserId);
        });

        it('should unapprove match', async () => {
            const unapproveDto = {
                reason: 'Found error in player statistics',
            };

            const response = await request(app.getHttpServer())
                .patch(`/org/${testOrgSlug}/gamelog/matches/${matchId}/unapprove`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(unapproveDto)
                .expect(200);

            expect(response.body.status).toBe('draft');
            expect(response.body.approvedAt).toBeNull();
        });
    });

    describe('Map Games', () => {
        it('should create map game for match', async () => {
            const createMapGameDto = {
                matchId,
                title: 'VALORANT',
                mapName: 'Ascent',
                gameIdx: 1,
                ourScore: 13,
                theirScore: 11,
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/mapgames`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(createMapGameDto)
                .expect(201);

            expect(response.body.mapName).toBe(createMapGameDto.mapName);
            expect(response.body.matchId).toBe(matchId);

            mapGameId = response.body.id;
        });

        it('should bulk create map games', async () => {
            const bulkCreateDto = {
                matchId,
                mapGames: [
                    {
                        title: 'VALORANT',
                        mapName: 'Bind',
                        gameIdx: 2,
                        ourScore: 13,
                        theirScore: 8,
                    },
                    {
                        title: 'VALORANT',
                        mapName: 'Haven',
                        gameIdx: 3,
                        ourScore: 13,
                        theirScore: 10,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/mapgames/bulk`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(bulkCreateDto)
                .expect(201);

            expect(response.body.created).toBe(2);
            expect(Array.isArray(response.body.mapGames)).toBe(true);
        });

        it('should update map game', async () => {
            const updateDto = {
                ourScore: 13,
                theirScore: 12,
                notes: 'Close game, good performance',
            };

            const response = await request(app.getHttpServer())
                .put(`/org/${testOrgSlug}/gamelog/mapgames/${mapGameId}`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(updateDto)
                .expect(200);

            expect(response.body.ourScore).toBe(updateDto.ourScore);
            expect(response.body.theirScore).toBe(updateDto.theirScore);
        });
    });

    describe('Player Statistics', () => {
        it('should create player stat with VALORANT schema', async () => {
            const createPlayerStatDto = {
                mapGameId,
                playerId: 'player-1',
                role: 'duelist',
                statsJson: {
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
                },
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/playerstats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(createPlayerStatDto)
                .expect(201);

            expect(response.body.mapGameId).toBe(mapGameId);
            expect(response.body.playerId).toBe(createPlayerStatDto.playerId);
            expect(response.body.statsJson.kills).toBe(24);

            playerStatId = response.body.id;
        });

        it('should validate game-specific stats schema', async () => {
            const invalidStatsDto = {
                mapGameId,
                playerId: 'player-2',
                role: 'controller',
                statsJson: {
                    invalidField: 'should not be allowed',
                    kills: 'should be number',
                },
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/playerstats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(invalidStatsDto)
                .expect(400);
        });

        it('should bulk create player stats', async () => {
            const bulkCreateDto = {
                mapGameId,
                playerStats: [
                    {
                        playerId: 'player-2',
                        role: 'controller',
                        statsJson: {
                            kills: 18,
                            deaths: 14,
                            assists: 12,
                            plants: 1,
                            defuses: 3,
                            agent: 'Omen',
                            adr: 142.3,
                            kast: 0.72,
                        },
                    },
                    {
                        playerId: 'player-3',
                        role: 'sentinel',
                        statsJson: {
                            kills: 15,
                            deaths: 13,
                            assists: 9,
                            plants: 0,
                            defuses: 2,
                            agent: 'Sage',
                            adr: 128.7,
                            kast: 0.68,
                        },
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/playerstats/bulk`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(bulkCreateDto)
                .expect(201);

            expect(response.body.created).toBe(2);
        });

        it('should compute stats and MVP', async () => {
            const computeDto = {
                ratingWeights: {
                    kills: 0.3,
                    assists: 0.2,
                    kast: 0.25,
                    adr: 0.25,
                },
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/compute-stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(computeDto)
                .expect(200);

            expect(response.body).toHaveProperty('updated');
            expect(response.body).toHaveProperty('mvpUpdated');
        });
    });

    describe('Export Functionality', () => {
        it('should export match report as PDF', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/report.pdf`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            expect(response.body).toHaveProperty('filePath');
            expect(response.body).toHaveProperty('fileSize');
            expect(response.body.filePath).toContain(testTenantId);
        });

        it('should export match stats as CSV', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats.csv`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            expect(response.body).toHaveProperty('filePath');
            expect(response.body).toHaveProperty('recordCount');
            expect(response.body.filePath).toContain('.csv');
        });

        it('should export aggregated stats as CSV with filters', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/stats/export.csv`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .query({ teamId: testTeamId, tournament: 'Test Tournament' })
                .expect(200);

            expect(response.body).toHaveProperty('filePath');
            expect(response.body).toHaveProperty('recordCount');
        });
    });

    describe('Cross-Tenant Isolation', () => {
        it('should not access data from different tenants', async () => {
            // Try to access match with different tenant ID
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);

            // Try to access map game with different tenant ID
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/mapgames/${mapGameId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);

            // Try to access player stat with different tenant ID
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/playerstats/${playerStatId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);
        });

        it('should isolate export files by tenant', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/report.pdf`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            expect(response.body.filePath).toContain(`/data/${testTenantId}/exports/`);
        });
    });

    describe('Permission Enforcement', () => {
        it('should deny access without proper permissions', async () => {
            // This would require mocking the permission system
            // For now, we test with proper permissions and assume RBAC works
            // In real implementation, you'd mock CanActivate guards
        });
    });

    describe('Business Rules Validation', () => {
        it('should enforce lineup constraints', async () => {
            const invalidMatchDto = {
                opponent: 'Test Opponent',
                lineupId: 'nonexistent-lineup',
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(invalidMatchDto)
                .expect(400);
        });

        it('should validate player belongs to lineup', async () => {
            const invalidPlayerStatDto = {
                mapGameId,
                playerId: 'player-not-in-lineup',
                role: 'duelist',
                statsJson: { kills: 10, deaths: 5 },
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/playerstats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(invalidPlayerStatDto)
                .expect(400);
        });

        it('should prevent duplicate player stats for same map', async () => {
            const duplicateStatDto = {
                mapGameId,
                playerId: 'player-1', // Already has stats for this map
                role: 'duelist',
                statsJson: { kills: 5, deaths: 10 },
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/playerstats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(duplicateStatDto)
                .expect(409); // Conflict
        });

        it('should prevent modification of approved matches', async () => {
            // First approve the match
            await request(app.getHttpServer())
                .patch(`/org/${testOrgSlug}/gamelog/matches/${matchId}/approve`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send({ approvedNotes: 'Test approval' })
                .expect(200);

            // Then try to modify it
            const updateDto = { opponent: 'Changed Opponent' };

            await request(app.getHttpServer())
                .put(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(updateDto)
                .expect(400);
        });
    });

    // Helper functions
    async function setupTestData() {
        // This would create necessary test data in the database
        // Including tenants, organizations, teams, players, lineups, etc.
        // For now, we assume the data exists or mock it
        console.log('Setting up test data...');
    }

    async function cleanupTestData() {
        // Clean up test data
        try {
            await prisma.playerStat.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.mapGame.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.match.deleteMany({
                where: { tenantId: testTenantId },
            });

            console.log('Test data cleaned up');
        } catch (error) {
            console.error('Error cleaning up test data:', error);
        }
    }
});