import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../database/prisma.service';
import { GameLogService } from '../services/gamelog.service';

describe('GameLogService', () => {
    let service: GameLogService;
    let prisma: PrismaService;

    const mockPrismaService = {
        match: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        lineup: {
            findFirst: jest.fn(),
        },
        team: {
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameLogService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<GameLogService>(GameLogService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createMatch', () => {
        const createMatchDto = {
            opponent: 'Test Opponent',
            tournament: 'Test Tournament',
            stage: 'Group Stage',
            lineupId: 'lineup-1',
        };

        it('should create a match successfully', async () => {
            const mockLineup = {
                id: 'lineup-1',
                team: { id: 'team-1', game: 'VALORANT' },
                tenantId: 'tenant-1'
            };

            const mockMatch = {
                id: 'match-1',
                ...createMatchDto,
                tenantId: 'tenant-1',
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.lineup.findFirst.mockResolvedValue(mockLineup);
            mockPrismaService.match.create.mockResolvedValue(mockMatch);

            const result = await service.createMatch('tenant-1', createMatchDto, 'user-1');

            expect(result).toEqual(mockMatch);
            expect(mockPrismaService.lineup.findFirst).toHaveBeenCalledWith({
                where: { id: createMatchDto.lineupId, tenantId: 'tenant-1' },
                include: { team: true },
            });
            expect(mockPrismaService.match.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if lineup not found', async () => {
            mockPrismaService.lineup.findFirst.mockResolvedValue(null);

            await expect(
                service.createMatch('tenant-1', createMatchDto, 'user-1')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('getMatch', () => {
        it('should return match if found', async () => {
            const mockMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                opponent: 'Test Opponent',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(mockMatch);

            const result = await service.getMatch('tenant-1', 'match-1');

            expect(result).toEqual(mockMatch);
            expect(mockPrismaService.match.findFirst).toHaveBeenCalledWith({
                where: { id: 'match-1', tenantId: 'tenant-1' },
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if match not found', async () => {
            mockPrismaService.match.findFirst.mockResolvedValue(null);

            await expect(service.getMatch('tenant-1', 'match-1')).rejects.toThrow(
                NotFoundException
            );
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
            };

            const updatedMatch = {
                ...existingMatch,
                ...updateDto,
            };

            mockPrismaService.match.findFirst.mockResolvedValue(existingMatch);
            mockPrismaService.match.update.mockResolvedValue(updatedMatch);

            const result = await service.updateMatch('tenant-1', 'match-1', updateDto);

            expect(result).toEqual(updatedMatch);
            expect(mockPrismaService.match.update).toHaveBeenCalledWith({
                where: { id: 'match-1' },
                data: { ...updateDto, updatedAt: expect.any(Date) },
                include: expect.any(Object),
            });
        });

        it('should throw BadRequestException if trying to update approved match', async () => {
            const approvedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'approved',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(approvedMatch);

            await expect(
                service.updateMatch('tenant-1', 'match-1', updateDto)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('submitMatch', () => {
        const submitDto = {
            submittedNotes: 'Ready for approval',
        };

        it('should submit match for approval', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            const submittedMatch = {
                ...draftMatch,
                status: 'submitted',
                submittedAt: new Date(),
                submittedBy: 'user-1',
                submittedNotes: submitDto.submittedNotes,
            };

            mockPrismaService.match.findFirst.mockResolvedValue(draftMatch);
            mockPrismaService.match.update.mockResolvedValue(submittedMatch);

            const result = await service.submitMatch('tenant-1', 'match-1', submitDto, 'user-1');

            expect(result).toEqual(submittedMatch);
            expect(mockPrismaService.match.update).toHaveBeenCalledWith({
                where: { id: 'match-1' },
                data: {
                    status: 'submitted',
                    submittedAt: expect.any(Date),
                    submittedBy: 'user-1',
                    submittedNotes: submitDto.submittedNotes,
                    updatedAt: expect.any(Date),
                },
                include: expect.any(Object),
            });
        });

        it('should throw BadRequestException if match not in draft status', async () => {
            const submittedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'submitted',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(submittedMatch);

            await expect(
                service.submitMatch('tenant-1', 'match-1', submitDto, 'user-1')
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('approveMatch', () => {
        const approveDto = {
            approvedNotes: 'Approved after review',
        };

        it('should approve match successfully', async () => {
            const submittedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'submitted',
            };

            const approvedMatch = {
                ...submittedMatch,
                status: 'approved',
                approvedAt: new Date(),
                approvedBy: 'user-1',
                approvedNotes: approveDto.approvedNotes,
            };

            mockPrismaService.match.findFirst.mockResolvedValue(submittedMatch);
            mockPrismaService.match.update.mockResolvedValue(approvedMatch);

            const result = await service.approveMatch('tenant-1', 'match-1', approveDto, 'user-1');

            expect(result).toEqual(approvedMatch);
            expect(mockPrismaService.match.update).toHaveBeenCalledWith({
                where: { id: 'match-1' },
                data: {
                    status: 'approved',
                    approvedAt: expect.any(Date),
                    approvedBy: 'user-1',
                    approvedNotes: approveDto.approvedNotes,
                    updatedAt: expect.any(Date),
                },
                include: expect.any(Object),
            });
        });

        it('should throw BadRequestException if match not submitted', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(draftMatch);

            await expect(
                service.approveMatch('tenant-1', 'match-1', approveDto, 'user-1')
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
                approvedAt: new Date(),
                approvedBy: 'user-1',
            };

            const unapprovedMatch = {
                ...approvedMatch,
                status: 'draft',
                approvedAt: null,
                approvedBy: null,
                approvedNotes: null,
                unapprovedReason: unapproveDto.reason,
            };

            mockPrismaService.match.findFirst.mockResolvedValue(approvedMatch);
            mockPrismaService.match.update.mockResolvedValue(unapprovedMatch);

            const result = await service.unapproveMatch('tenant-1', 'match-1', unapproveDto, 'user-1');

            expect(result).toEqual(unapprovedMatch);
            expect(mockPrismaService.match.update).toHaveBeenCalledWith({
                where: { id: 'match-1' },
                data: {
                    status: 'draft',
                    approvedAt: null,
                    approvedBy: null,
                    approvedNotes: null,
                    unapprovedAt: expect.any(Date),
                    unapprovedBy: 'user-1',
                    unapprovedReason: unapproveDto.reason,
                    updatedAt: expect.any(Date),
                },
                include: expect.any(Object),
            });
        });

        it('should throw BadRequestException if match not approved', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(draftMatch);

            await expect(
                service.unapproveMatch('tenant-1', 'match-1', unapproveDto, 'user-1')
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('listMatches', () => {
        const queryDto = {
            status: 'draft' as const,
            limit: 10,
            offset: 0,
        };

        it('should list matches with pagination', async () => {
            const mockMatches = [
                { id: 'match-1', opponent: 'Team A' },
                { id: 'match-2', opponent: 'Team B' },
            ];

            mockPrismaService.match.findMany.mockResolvedValue(mockMatches);
            mockPrismaService.match.count.mockResolvedValue(2);

            const result = await service.listMatches('tenant-1', queryDto);

            expect(result).toEqual({
                matches: mockMatches,
                total: 2,
                limit: 10,
                offset: 0,
            });

            expect(mockPrismaService.match.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    status: 'draft',
                },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
                take: 10,
                skip: 0,
            });
        });

        it('should handle filtering by tournament', async () => {
            const queryWithTournament = {
                ...queryDto,
                tournament: 'VCT',
            };

            mockPrismaService.match.findMany.mockResolvedValue([]);
            mockPrismaService.match.count.mockResolvedValue(0);

            await service.listMatches('tenant-1', queryWithTournament);

            expect(mockPrismaService.match.findMany).toHaveBeenCalledWith({
                where: {
                    tenantId: 'tenant-1',
                    status: 'draft',
                    tournament: { contains: 'VCT', mode: 'insensitive' },
                },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
                take: 10,
                skip: 0,
            });
        });
    });

    describe('deleteMatch', () => {
        it('should delete match successfully', async () => {
            const draftMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'draft',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(draftMatch);
            mockPrismaService.match.delete.mockResolvedValue(draftMatch);

            const result = await service.deleteMatch('tenant-1', 'match-1');

            expect(result).toEqual(draftMatch);
            expect(mockPrismaService.match.delete).toHaveBeenCalledWith({
                where: { id: 'match-1' },
            });
        });

        it('should throw BadRequestException if trying to delete approved match', async () => {
            const approvedMatch = {
                id: 'match-1',
                tenantId: 'tenant-1',
                status: 'approved',
            };

            mockPrismaService.match.findFirst.mockResolvedValue(approvedMatch);

            await expect(service.deleteMatch('tenant-1', 'match-1')).rejects.toThrow(
                BadRequestException
            );
        });
    });
});