import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { GameLogService } from '../services/gamelog.service';

describe('GameLogService', () => {
    let service: GameLogService;

    const createMockTransaction = () => ({
        $executeRaw: jest.fn().mockResolvedValue(undefined),
        team: {
            findFirst: jest.fn(),
        },
        lineup: {
            findFirst: jest.fn(),
        },
        orgUser: {
            findFirst: jest.fn(),
        },
        match: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        achievement: {
            create: jest.fn(),
        },
    });

    const mockPrismaService = {
        $transaction: jest.fn(),
    };

    const mockDiscordService = {
        notifyMatch: jest.fn(),
    };

    let mockTx: ReturnType<typeof createMockTransaction>;
    const now = new Date('2024-01-01T00:00:00.000Z');

    beforeEach(async () => {
        mockTx = createMockTransaction();
        mockPrismaService.$transaction.mockImplementation(async (callback) => callback(mockTx));
        mockDiscordService.notifyMatch.mockResolvedValue(undefined);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameLogService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: DiscordService,
                    useValue: mockDiscordService,
                },
            ],
        }).compile();

        service = module.get<GameLogService>(GameLogService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createMatch', () => {
        const createMatchDto = {
            teamId: 'team-1',
            opponent: 'Test Opponent',
            tournament: 'Test Tournament',
            stage: 'Group Stage',
            lineupId: 'lineup-1',
        };

        it('should create a match successfully', async () => {
            mockTx.team.findFirst.mockResolvedValue({ id: 'team-1', tenantId: 'tenant-1' });
            mockTx.lineup.findFirst.mockResolvedValue({ id: 'lineup-1', tenantId: 'tenant-1', teamId: 'team-1' });
            mockTx.orgUser.findFirst.mockResolvedValue({ id: 'user-1', globalUserId: 'global-user-1' });
            mockTx.match.create.mockResolvedValue({
                id: 'match-1',
                tenantId: 'tenant-1',
                eventId: null,
                teamId: 'team-1',
                lineupId: 'lineup-1',
                opponent: createMatchDto.opponent,
                tournament: createMatchDto.tournament,
                stage: createMatchDto.stage,
                bestOf: 1,
                startedAt: null,
                endedAt: null,
                status: 'draft',
                result: null,
                score: null,
                vodUrl: null,
                notes: null,
                createdBy: 'user-1',
                createdAt: now,
                updatedAt: now,
                team: { id: 'team-1', name: 'Alpha', game: 'VALORANT' },
                lineup: { id: 'lineup-1', title: 'Starting Five', slots: [] },
                maps: [],
                playerStats: [],
            });

            const result = await service.createMatch('tenant-1', 'user-1', createMatchDto);

            expect(mockTx.$executeRaw).toHaveBeenCalled();
            expect(mockTx.match.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tenantId: 'tenant-1', createdByGlobalUserId: 'global-user-1' }) }));
            expect(result).toMatchObject({
                id: 'match-1',
                tenantId: 'tenant-1',
                teamId: 'team-1',
                opponent: 'Test Opponent',
                team: {
                    id: 'team-1',
                    name: 'Alpha',
                },
            });
        });

        it('should throw NotFoundException if lineup not found', async () => {
            mockTx.team.findFirst.mockResolvedValue({ id: 'team-1', tenantId: 'tenant-1' });
            mockTx.lineup.findFirst.mockResolvedValue(null);

            await expect(
                service.createMatch('tenant-1', 'user-1', createMatchDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if team not found', async () => {
            mockTx.team.findFirst.mockResolvedValue(null);

            await expect(
                service.createMatch('tenant-1', 'user-1', createMatchDto)
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findMatchById', () => {
        it('should throw NotFoundException if match not found', async () => {
            mockTx.match.findFirst.mockResolvedValue(null);

            await expect(service.findMatchById('tenant-1', 'match-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateMatch', () => {
        const updateDto = {
            opponent: 'Updated Opponent',
            result: 'win' as const,
            score: '2-1',
        };

        it('should update match successfully', async () => {
            const existingMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
                teamId: 'team-1',
            };

            const updatedMatch = {
                ...existingMatch,
                ...updateDto,
                createdAt: now,
                updatedAt: now,
                team: { id: 'team-1', name: 'Alpha', game: 'VALORANT' },
                lineup: null,
            };

            mockTx.match.findFirst.mockResolvedValue(existingMatch);
            mockTx.match.update.mockResolvedValue({ ...updatedMatch, maps: [], playerStats: [] });

            const result = await service.updateMatch('tenant-1', 'match-1', updateDto);

            expect(mockTx.match.update).toHaveBeenCalled();
            expect(result).toMatchObject({ id: 'match-1', opponent: 'Updated Opponent', result: 'win' });
        });

        it('should throw BadRequestException if trying to update approved match', async () => {
            const approvedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'approved',
                teamId: 'team-1',
            };

            mockTx.match.findFirst.mockResolvedValue(approvedMatch);

            await expect(
                service.updateMatch('tenant-1', 'match-1', updateDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('submitMatch', () => {
        it('should submit match for approval', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
                notes: null,
            };

            const submittedMatch = {
                ...draftMatch,
                status: 'submitted',
                createdAt: now,
                updatedAt: now,
                notes: 'Submission notes: Ready for approval',
                team: null,
                lineup: null,
                maps: [],
                playerStats: [],
            };

            mockTx.match.findFirst.mockResolvedValue(draftMatch);
            mockTx.match.update.mockResolvedValue(submittedMatch);

            const result = await service.submitMatch('tenant-1', 'match-1', 'Ready for approval');

            expect(mockTx.match.update).toHaveBeenCalled();
            expect(result.status).toBe('submitted');
        });

        it('should throw BadRequestException if match not in draft status', async () => {
            const submittedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'submitted',
            };

            mockTx.match.findFirst.mockResolvedValue(submittedMatch);

            await expect(
                service.submitMatch('tenant-1', 'match-1', 'Ready for approval')
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('approveMatch', () => {
        it('should approve match successfully', async () => {
            const submittedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'submitted',
                result: 'loss',
                score: '2-1',
                tournament: 'VCT',
                notes: 'Existing notes',
                maps: [],
                opponent: 'Test Opponent',
            };

            const approvedMatch = {
                ...submittedMatch,
                status: 'approved',
                createdAt: now,
                updatedAt: now,
                notes: 'Existing notes\n\nApproval notes: Approved after review',
                team: { id: 'team-1', name: 'Alpha', game: 'VALORANT' },
                lineup: {
                    id: 'lineup-1',
                    title: 'Starting Five',
                    slots: [
                        {
                            playerId: 'player-1',
                            role: 'starter',
                            player: { gamerTag: 'PlayerOne', role: 'duelist', globalUserId: 'global-user-1' },
                        },
                    ],
                },
                maps: [],
                playerStats: [],
            };

            mockTx.match.findFirst.mockResolvedValue(submittedMatch);
            mockTx.match.update.mockResolvedValue(approvedMatch);

            const result = await service.approveMatch('tenant-1', 'match-1', 'Approved after review');

            expect(mockTx.match.update).toHaveBeenCalled();
            expect(mockDiscordService.notifyMatch).toHaveBeenCalledWith(
                'tenant-1',
                expect.objectContaining({ opponent: 'Test Opponent' }),
                ['global-user-1']
            );
            expect(result.status).toBe('approved');
            expect(result.notes).toContain('Approval notes');
        });

        it('should throw BadRequestException if match not submitted', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
                maps: [],
            };

            mockTx.match.findFirst.mockResolvedValue(draftMatch);

            await expect(
                service.approveMatch('tenant-1', 'match-1', 'Approved after review')
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('unapproveMatch', () => {
        const unapproveDto = {
            reason: 'Found errors in statistics',
        };

        it('should unapprove match successfully', async () => {
            const approvedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'approved',
                notes: 'Existing notes',
            };

            const unapprovedMatch = {
                ...approvedMatch,
                status: 'submitted',
                createdAt: now,
                updatedAt: now,
                notes: `Existing notes\n\nUnapproval reason: ${unapproveDto.reason}`,
                team: null,
                lineup: null,
                maps: [],
                playerStats: [],
            };

            mockTx.match.findFirst.mockResolvedValue(approvedMatch);
            mockTx.match.update.mockResolvedValue(unapprovedMatch);

            const result = await service.unapproveMatch('tenant-1', 'match-1', unapproveDto.reason);

            expect(mockTx.match.update).toHaveBeenCalled();
            expect(result.status).toBe('submitted');
            expect(result.notes).toContain(unapproveDto.reason);
        });

        it('should throw BadRequestException if match not approved', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            mockTx.match.findFirst.mockResolvedValue(draftMatch);

            await expect(
                service.unapproveMatch('tenant-1', 'match-1', unapproveDto.reason)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findMatches', () => {
        const queryDto = {
            status: 'draft' as const,
            limit: 10,
            page: 1,
        };

        it('should list matches with pagination', async () => {
            mockTx.match.findMany.mockResolvedValue([
                {
                    id: 'match-1',
                    tenantId: 'tenant-1',
                    teamId: 'team-1',
                    lineupId: null,
                    opponent: 'Team A',
                    tournament: null,
                    stage: null,
                    bestOf: 1,
                    startedAt: null,
                    endedAt: null,
                    status: 'draft',
                    result: null,
                    score: null,
                    vodUrl: null,
                    notes: null,
                    createdBy: 'user-1',
                    createdAt: now,
                    updatedAt: now,
                    team: { id: 'team-1', name: 'Alpha', game: 'VALORANT' },
                    lineup: null,
                    maps: [],
                    playerStats: [],
                    _count: { maps: 0, playerStats: 0 },
                },
            ]);
            mockTx.match.count.mockResolvedValue(1);

            const result = await service.findMatches('tenant-1', queryDto as any);

            expect(mockTx.match.findMany).toHaveBeenCalled();
            expect(result.total).toBe(1);
            expect(result.matches[0]).toMatchObject({ id: 'match-1', teamId: 'team-1' });
        });
    });

    describe('deleteMatch', () => {
        it('should delete match successfully', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            mockTx.match.findFirst.mockResolvedValue(draftMatch);
            mockTx.match.delete.mockResolvedValue(undefined);

            const result = await service.deleteMatch('tenant-1', 'match-1');

            expect(result).toBeUndefined();
            expect(mockTx.match.delete).toHaveBeenCalledWith({
                where: { id: 'match-1' },
            });
        });

        it('should delete approved match without error', async () => {
            const approvedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'approved',
            };

            mockTx.match.findFirst.mockResolvedValue(approvedMatch);
            mockTx.match.delete.mockResolvedValue(undefined);

            await expect(service.deleteMatch('tenant-1', 'match-1')).resolves.toBeUndefined();
            expect(mockTx.match.delete).toHaveBeenCalled();
        });
    });
});