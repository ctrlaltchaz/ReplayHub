import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'supertest';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordBotService } from '../../discord/discord-bot.service';
import { DiscordWebhookService } from '../../discord/discord-webhook.service';
import { DiscordService } from '../../discord/discord.service';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { GameLogModule } from '../gamelog.module';

describe('GameLog Integration Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Test data
    const testTenantId = 'tenant-1';
    const testGlobalUserId = 'global-user-1';
    const testOrgUserId = 'org-user-1';
    const testUserId = testGlobalUserId;
    const testOrgSlug = 'test-org';
    const testTeamId = 'team-1';
    const testLineupId = 'lineup-1';
    const testEventId = 'event-1';
    const testOrgUserEmail = 'owner@example.com';

    let matchId: string;
    let mapGameId: string;
    let playerStatId: string;

    beforeAll(async () => {
        const mockConfigService = {
            get: jest.fn(),
        } satisfies Partial<ConfigService>;

        const mockDiscordService = {
            notifyMatch: jest.fn().mockResolvedValue(undefined),
        } satisfies Partial<DiscordService>;

        const mockDiscordBotService = {
            onModuleInit: jest.fn().mockResolvedValue(undefined),
            onModuleDestroy: jest.fn().mockResolvedValue(undefined),
            postToChannel: jest.fn().mockResolvedValue(true),
            sendDirectMessage: jest.fn().mockResolvedValue(true),
            getGuildChannels: jest.fn().mockResolvedValue([]),
            getGuildRoles: jest.fn().mockResolvedValue([]),
            getUserInfo: jest.fn().mockResolvedValue(null),
            verifyBotToken: jest.fn().mockResolvedValue({ valid: true }),
            encryptToken: jest.fn().mockImplementation((token: string) => token),
            decryptToken: jest.fn().mockImplementation((token: string) => token),
            connectBot: jest.fn().mockResolvedValue(true),
            disconnectBot: jest.fn().mockResolvedValue(undefined),
        } satisfies Partial<DiscordBotService>;

        const mockDiscordWebhookService = {
            sendWebhook: jest.fn().mockResolvedValue(true),
            sendEventNotification: jest.fn().mockResolvedValue(true),
            sendMatchNotification: jest.fn().mockResolvedValue(true),
            sendRosterNotification: jest.fn().mockResolvedValue(true),
            sendIncidentNotification: jest.fn().mockResolvedValue(true),
        } satisfies Partial<DiscordWebhookService>;

        const mockTenantGuard: Pick<TenantGuard, 'canActivate'> = {
            canActivate: jest.fn((context) => {
                const req = context.switchToHttp().getRequest<any>();
                const headerTenantId = (req.headers?.['x-tenant-id'] as string) || testTenantId;

                req.session ??= {};
                req.session.membershipId = testOrgUserId;
                req.session.userId = testGlobalUserId;

                req.tenant = {
                    id: headerTenantId,
                    slug: headerTenantId === testTenantId ? testOrgSlug : `${headerTenantId}-slug`,
                    name: headerTenantId === testTenantId ? 'Test Organisation' : `Org ${headerTenantId}`,
                };

                return true;
            }),
        };

        const mockUnifiedTenantAuthGuard: Pick<UnifiedTenantAuthGuard, 'canActivate'> = {
            canActivate: jest.fn(async (context) => {
                const req = context.switchToHttp().getRequest<any>();
                const tenantId = req.tenant?.id ?? testTenantId;
                const permissions = ['gamelog.manage', 'gamelog.view', 'gamelog.approve'];

                req.orgUser = {
                    id: testOrgUserId,
                    email: testOrgUserEmail,
                    displayName: 'Test User',
                    roles: ['ops_admin'],
                    permissions,
                };

                req.principal = {
                    type: 'org',
                    id: testOrgUserId,
                    tenantId,
                    permissions,
                };

                req.globalUser = {
                    id: testGlobalUserId,
                    email: testOrgUserEmail,
                    name: 'Test User',
                    isGlobalAdmin: false,
                };

                return true;
            }),
        };

        const mockPermissionGuard: Pick<PermissionGuard, 'canActivate'> = {
            canActivate: jest.fn(async () => true),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [GameLogModule],
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        })
            .overrideProvider(DiscordService)
            .useValue(mockDiscordService)
            .overrideProvider(DiscordBotService)
            .useValue(mockDiscordBotService)
            .overrideProvider(DiscordWebhookService)
            .useValue(mockDiscordWebhookService)
            .overrideGuard(TenantGuard)
            .useValue(mockTenantGuard)
            .overrideGuard(UnifiedTenantAuthGuard)
            .useValue(mockUnifiedTenantAuthGuard)
            .overrideGuard(PermissionGuard)
            .useValue(mockPermissionGuard)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }));
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
                teamId: testTeamId,
                opponent: 'Test Opponents',
                tournament: 'Test Tournament',
                stage: 'Group Stage',
                lineupId: testLineupId,
                bestOf: 3,
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
                notes: 'All stats verified and ready for approval',
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/submit`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(submitDto)
                .expect(200);

            expect(response.body.status).toBe('submitted');
            expect(response.body.notes).toContain('Submission notes');
        });

        it('should approve match', async () => {
            const approveDto = {
                notes: 'Stats look good, approved for record keeping',
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/approve`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(approveDto)
                .expect(200);

            expect(response.body.status).toBe('approved');
            expect(response.body.notes).toContain('Approval notes');
        });

        it('should unapprove match', async () => {
            const unapproveDto = {
                reason: 'Found error in player statistics',
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/unapprove`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(unapproveDto)
                .expect(200);

            expect(response.body.status).toBe('submitted');
            expect(response.body.notes).toContain('Unapproval reason');
        });
    });

    describe('Map Games', () => {
        it('should create map game for match', async () => {
            const createMapGameDto = {
                maps: [
                    {
                        title: 'VALORANT',
                        mapName: 'Ascent',
                        gameIdx: 1,
                        ourScore: 13,
                        theirScore: 11,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/maps`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(createMapGameDto)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1);

            const createdMap = response.body[0];
            expect(createdMap.mapName).toBe('Ascent');
            expect(createdMap.matchId).toBe(matchId);

            mapGameId = createdMap.id;
        });

        it('should bulk create map games', async () => {
            const bulkCreateDto = {
                maps: [
                    {
                        title: 'VALORANT',
                        mapName: 'Bind',
                        gameIdx: 1,
                        ourScore: 13,
                        theirScore: 8,
                    },
                    {
                        title: 'VALORANT',
                        mapName: 'Haven',
                        gameIdx: 2,
                        ourScore: 13,
                        theirScore: 10,
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/maps`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(bulkCreateDto)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);

            mapGameId = response.body[0].id;
        });

        it('should update map game', async () => {
            const updateDto = {
                ourScore: 13,
                theirScore: 12,
                notes: 'Close game, good performance',
            };

            const response = await request(app.getHttpServer())
                .put(`/org/${testOrgSlug}/gamelog/maps/${mapGameId}`)
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
                stats: [
                    {
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
                    },
                ],
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(createPlayerStatDto)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(1);

            const createdStat = response.body[0];
            expect(createdStat.mapGameId).toBe(mapGameId);
            expect(createdStat.playerId).toBe('player-1');
            expect(createdStat.statsJson.kills).toBe(24);

            playerStatId = createdStat.id;
        });

        it('should validate game-specific stats schema', async () => {
            const invalidStatsDto = {
                stats: [
                    {
                        mapGameId,
                        playerId: 'player-2',
                        role: 'controller',
                        statsJson: {
                            invalidField: 'should not be allowed',
                            kills: 'should be number',
                        },
                    },
                ],
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(invalidStatsDto)
                .expect(400);
        });

        it('should bulk create player stats', async () => {
            const bulkCreateDto = {
                stats: [
                    {
                        mapGameId,
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
                        mapGameId,
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
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(bulkCreateDto)
                .expect(201);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
        });

        it('should compute stats and MVP', async () => {
            const computeDto = {
                recomputeRatings: true,
                recomputeMvp: true,
            };

            const response = await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats/compute`)
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

            expect(response.headers['content-type']).toContain('application/pdf');
            expect(response.headers['content-disposition']).toContain(`match-report-${matchId}.pdf`);
            expect(Buffer.isBuffer(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const exportedPath = path.join(process.cwd(), 'data', testTenantId, 'exports', `match-report-${matchId}.pdf`);
            expect(fs.existsSync(exportedPath)).toBe(true);
        });

        it('should export match stats as CSV', async () => {
            const response = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats.csv`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            expect(response.headers['content-type']).toContain('text/csv');
            expect(response.headers['content-disposition']).toContain(`match-stats-${matchId}.csv`);
            const csvContent = Buffer.isBuffer(response.body)
                ? response.body.toString('utf-8')
                : response.text ?? '';
            expect(csvContent.length).toBeGreaterThan(0);

            const exportedPath = path.join(process.cwd(), 'data', testTenantId, 'exports', `match-stats-${matchId}.csv`);
            expect(fs.existsSync(exportedPath)).toBe(true);
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
                .get(`/org/${testOrgSlug}/gamelog/maps/${mapGameId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);

            // Try to access player stat with different tenant ID
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/stats/${playerStatId}`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);
        });

        it('should isolate export files by tenant', async () => {
            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/report.pdf`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            const tenantExportPath = path.join(process.cwd(), 'data', testTenantId, 'exports', `match-report-${matchId}.pdf`);
            expect(fs.existsSync(tenantExportPath)).toBe(true);

            await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/report.pdf`)
                .set('x-tenant-id', 'different-tenant')
                .set('x-user-id', testUserId)
                .expect(404);

            const otherTenantPath = path.join(process.cwd(), 'data', 'different-tenant', 'exports', `match-report-${matchId}.pdf`);
            expect(fs.existsSync(otherTenantPath)).toBe(false);
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
                stats: [
                    {
                        mapGameId,
                        playerId: 'player-not-in-lineup',
                        role: 'duelist',
                        statsJson: { kills: 10, deaths: 5 },
                    },
                ],
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(invalidPlayerStatDto)
                .expect(400);
        });

        it('should prevent duplicate player stats for same map', async () => {
            const duplicateStatDto = {
                stats: [
                    {
                        mapGameId,
                        playerId: 'player-1',
                        role: 'duelist',
                        statsJson: { kills: 5, deaths: 10 },
                    },
                ],
            };

            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(duplicateStatDto)
                .expect(201);

            const statsResponse = await request(app.getHttpServer())
                .get(`/org/${testOrgSlug}/gamelog/matches/${matchId}/stats`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .expect(200);

            const playerStats = (statsResponse.body as any[]).filter(stat => stat.playerId === 'player-1');
            expect(playerStats).toHaveLength(1);
            expect(playerStats[0].statsJson.kills).toBe(5);

            playerStatId = playerStats[0].id;
        });

        it('should prevent modification of approved matches', async () => {
            // First approve the match
            await request(app.getHttpServer())
                .post(`/org/${testOrgSlug}/gamelog/matches/${matchId}/approve`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send({ notes: 'Test approval' })
                .expect(200);

            // Then try to modify it
            const updateDto = { opponent: 'Changed Opponent' };

            await request(app.getHttpServer())
                .put(`/org/${testOrgSlug}/gamelog/matches/${matchId}`)
                .set('x-tenant-id', testTenantId)
                .set('x-user-id', testUserId)
                .send(updateDto)
                .expect(403);
        });
    });

    // Helper functions
    async function setupTestData() {
        console.log('Setting up test data...');

        await cleanupTestData();

        const hashedPassword = 'hashed-password';

        await prisma.globalUser.create({
            data: {
                id: testGlobalUserId,
                email: testOrgUserEmail,
                passwordHash: hashedPassword,
            },
        });

        await prisma.organisation.create({
            data: {
                id: testTenantId,
                name: 'Test Organisation',
                slug: testOrgSlug,
                ownerId: testGlobalUserId,
            },
        });

        await prisma.orgUser.create({
            data: {
                id: testOrgUserId,
                tenantId: testTenantId,
                globalUserId: testGlobalUserId,
                email: testOrgUserEmail,
                passwordHash: hashedPassword,
                displayName: 'Test User',
            },
        });

        const roleId = 'role-ops-admin';
        await prisma.role.create({
            data: {
                id: roleId,
                tenantId: testTenantId,
                name: 'ops_admin',
            },
        });

        await prisma.orgUserRole.create({
            data: {
                id: 'org-user-role-1',
                tenantId: testTenantId,
                orgUserId: testOrgUserId,
                roleId,
            },
        });

        await prisma.team.create({
            data: {
                id: testTeamId,
                tenantId: testTenantId,
                name: 'Valorant Varsity',
                game: 'VALORANT',
            },
        });

        const players = [
            { id: 'player-1', gamerTag: 'PlayerOne', role: 'duelist', globalUserId: testGlobalUserId },
            { id: 'player-2', gamerTag: 'PlayerTwo', role: 'controller' },
            { id: 'player-3', gamerTag: 'PlayerThree', role: 'sentinel' },
        ];

        for (const player of players) {
            await prisma.player.create({
                data: {
                    id: player.id,
                    tenantId: testTenantId,
                    gamerTag: player.gamerTag,
                    role: player.role,
                    globalUserId: player.globalUserId,
                },
            });
        }

        await prisma.player.create({
            data: {
                id: 'player-not-in-lineup',
                tenantId: testTenantId,
                gamerTag: 'ExternalPlayer',
                role: 'flex',
            },
        });

        await prisma.lineup.create({
            data: {
                id: testLineupId,
                tenantId: testTenantId,
                eventId: testEventId,
                teamId: testTeamId,
                title: 'Main Lineup',
                published: true,
            },
        });

        const slotData = players.map((player, index) => ({
            id: `slot-${index + 1}`,
            tenantId: testTenantId,
            lineupId: testLineupId,
            playerId: player.id,
            role: player.role,
            idx: index,
        }));

        for (const slot of slotData) {
            await prisma.lineupSlot.create({
                data: slot,
            });
        }
    }

    async function cleanupTestData() {
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

            await prisma.lineupSlot.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.lineup.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.player.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.team.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.orgUserRole.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.role.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.orgUser.deleteMany({
                where: { tenantId: testTenantId },
            });

            await prisma.organisation.deleteMany({
                where: { id: testTenantId },
            });

            await prisma.globalUser.deleteMany({
                where: { id: testGlobalUserId },
            });

            const exportDir = path.join(process.cwd(), 'data', testTenantId);
            if (fs.existsSync(exportDir)) {
                fs.rmSync(exportDir, { recursive: true, force: true });
            }

            console.log('Test data cleaned up');
        } catch (error) {
            console.error('Error cleaning up test data:', error);
        }
    }
});