import { BadRequestException, ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateLineupDto, LineupSlotDto, UpdateLineupDto } from '../dto';

@Injectable()
export class LineupService {
    constructor(private prisma: PrismaService) { }

    private async ensurePlayersOnTeam(
        tenantId: string,
        teamId: string,
        playerIds: string[],
        autoAttach: boolean = false
    ): Promise<{ validPlayers: string[], missingPlayers: string[] }> {
        // Find which players exist
        const existingPlayers = await this.prisma.player.findMany({
            where: {
                id: { in: playerIds },
                tenantId,
            },
            select: { id: true },
        });

        const existingPlayerIds = existingPlayers.map(p => p.id);
        const nonExistentPlayers = playerIds.filter(id => !existingPlayerIds.includes(id));

        if (nonExistentPlayers.length > 0) {
            throw new UnprocessableEntityException(`Players not found: ${nonExistentPlayers.join(', ')}`);
        }

        // Find which existing players are already on the team
        const playersOnTeam = await this.prisma.teamMember.findMany({
            where: {
                teamId,
                playerId: { in: existingPlayerIds },
                team: { tenantId },
            },
            select: { playerId: true },
        });

        const playersOnTeamIds = playersOnTeam.map(tm => tm.playerId);
        const missingFromTeam = existingPlayerIds.filter(id => !playersOnTeamIds.includes(id));

        if (missingFromTeam.length > 0) {
            if (!autoAttach) {
                throw new UnprocessableEntityException(`Players not on team: ${missingFromTeam.join(', ')}`);
            }

            // Auto-attach missing players to team
            await this.prisma.teamMember.createMany({
                data: missingFromTeam.map(playerId => ({
                    tenantId,
                    teamId,
                    playerId,
                    isStarter: false, // Default to bench
                    position: null,
                })),
                skipDuplicates: true,
            });
        }

        return {
            validPlayers: existingPlayerIds,
            missingPlayers: missingFromTeam,
        };
    }

    private async checkNotPublished(tenantId: string, lineupId: string): Promise<void> {
        const lineup = await this.prisma.lineup.findFirst({
            where: { id: lineupId, tenantId },
            select: { published: true },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found');
        }

        if (lineup.published) {
            throw new ConflictException('Cannot modify published lineup');
        }
    }

    async create(tenantId: string, eventId: string, createLineupDto: CreateLineupDto) {
        // Verify team exists
        const team = await this.prisma.team.findFirst({
            where: { id: createLineupDto.teamId, tenantId },
        });
        if (!team) {
            throw new NotFoundException('Team not found');
        }

        // Check if lineup already exists for this event
        const existing = await this.prisma.lineup.findFirst({
            where: { eventId, tenantId },
        });
        if (existing) {
            throw new ConflictException('Lineup already exists for this event');
        }

        return this.prisma.lineup.create({
            data: {
                tenantId,
                eventId,
                teamId: createLineupDto.teamId,
                title: createLineupDto.title,
            },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.lineup.findMany({
            where: { tenantId },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                _count: {
                    select: { slots: true },
                },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }

    async findOne(tenantId: string, id: string) {
        const lineup = await this.prisma.lineup.findFirst({
            where: { id, tenantId },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                                mainsJson: true,
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found');
        }

        return {
            ...lineup,
            slots: lineup.slots.map(slot => ({
                ...slot,
                player: slot.player ? {
                    ...slot.player,
                    mains: slot.player.mainsJson as string[],
                } : null,
            })),
        };
    }

    async findByEvent(tenantId: string, eventId: string) {
        const lineup = await this.prisma.lineup.findFirst({
            where: { eventId, tenantId },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                                mainsJson: true,
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found for this event');
        }

        return {
            ...lineup,
            slots: lineup.slots.map(slot => ({
                ...slot,
                player: {
                    ...slot.player,
                    mains: slot.player.mainsJson as string[],
                },
            })),
        };
    }

    async update(tenantId: string, id: string, updateLineupDto: UpdateLineupDto) {
        await this.checkNotPublished(tenantId, id);

        return this.prisma.lineup.update({
            where: { id },
            data: updateLineupDto,
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });
    }

    async setSlots(tenantId: string, lineupId: string, slots: LineupSlotDto[], autoAttachMissing: boolean = false) {
        await this.checkNotPublished(tenantId, lineupId);

        const lineup = await this.prisma.lineup.findFirst({
            where: { id: lineupId, tenantId },
            include: {
                team: {
                    select: { id: true },
                },
            },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found');
        }

        // Validate all players exist and ensure they're on the team
        const playerIds = slots.map(slot => slot.playerId);
        const { validPlayers } = await this.ensurePlayersOnTeam(
            tenantId,
            lineup.teamId,
            playerIds,
            autoAttachMissing
        );

        // Check for duplicate players
        const uniquePlayerIds = new Set(playerIds);
        if (uniquePlayerIds.size !== playerIds.length) {
            throw new BadRequestException('Duplicate players not allowed in lineup');
        }

        // Use transaction to replace all slots
        return this.prisma.$transaction(async (tx) => {
            // Delete existing slots
            await tx.lineupSlot.deleteMany({
                where: { lineupId, tenantId },
            });

            // Create new slots
            const createdSlots = await Promise.all(
                slots.map((slot, index) =>
                    tx.lineupSlot.create({
                        data: {
                            tenantId,
                            lineupId,
                            playerId: slot.playerId,
                            role: slot.role,
                            isSub: slot.isSub || false,
                            notes: slot.notes,
                            idx: slot.idx !== undefined ? slot.idx : index,
                        },
                        include: {
                            player: {
                                select: {
                                    id: true,
                                    gamerTag: true,
                                    role: true,
                                    rank: true,
                                    eligibility: true,
                                    mainsJson: true,
                                },
                            },
                        },
                    })
                )
            );

            // Return the updated lineup
            const updatedLineup = await tx.lineup.findFirst({
                where: { id: lineupId, tenantId },
                include: {
                    team: {
                        select: { id: true, name: true, game: true, season: true },
                    },
                    slots: {
                        include: {
                            player: {
                                select: {
                                    id: true,
                                    gamerTag: true,
                                    role: true,
                                    rank: true,
                                    eligibility: true,
                                    mainsJson: true,
                                },
                            },
                        },
                        orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                    },
                },
            });

            return {
                ...updatedLineup,
                slots: updatedLineup.slots.map(slot => ({
                    ...slot,
                    player: {
                        ...slot.player,
                        mains: slot.player.mainsJson as string[],
                    },
                })),
            };
        });
    }

    async removeSlot(tenantId: string, lineupId: string, slotId: string) {
        await this.checkNotPublished(tenantId, lineupId);

        const slot = await this.prisma.lineupSlot.findFirst({
            where: { id: slotId, lineupId, tenantId },
        });

        if (!slot) {
            throw new NotFoundException('Lineup slot not found');
        }

        return this.prisma.lineupSlot.delete({
            where: { id: slotId },
        });
    }

    async getAvailablePlayersForLineup(tenantId: string, teamId: string, date?: string) {
        const where: any = {
            tenantId,
            teams: {
                some: { teamId },
            },
            isActive: true,
            eligibility: { not: 'ineligible' },
        };

        const players = await this.prisma.player.findMany({
            where,
            include: {
                orgUser: {
                    select: { id: true, displayName: true, email: true },
                },
                teams: {
                    where: { teamId },
                    select: { isStarter: true, position: true },
                },
                availability: date ? {
                    where: { date: new Date(date) },
                    select: { status: true, note: true },
                } : undefined,
                _count: {
                    select: { lineupSlots: true },
                },
            },
            orderBy: [
                { gamerTag: 'asc' },
            ],
        });

        return players.map(player => ({
            ...player,
            mains: player.mainsJson as string[],
            teamMembership: (player as any).teams?.[0] || null,
            availability: date ? ((player as any).availability?.[0] || null) : null,
        }));
    }

    async publish(tenantId: string, lineupId: string) {
        const lineup = await this.prisma.lineup.findFirst({
            where: { id: lineupId, tenantId },
            include: {
                slots: true,
            },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found');
        }

        if (lineup.published) {
            throw new ConflictException('Lineup is already published');
        }

        if (lineup.slots.length === 0) {
            throw new BadRequestException('Cannot publish empty lineup');
        }

        return this.prisma.lineup.update({
            where: { id: lineupId },
            data: { published: true },
            include: {
                team: {
                    select: { id: true, name: true, game: true, season: true },
                },
                slots: {
                    include: {
                        player: {
                            select: {
                                id: true,
                                gamerTag: true,
                                role: true,
                                rank: true,
                                eligibility: true,
                                mainsJson: true,
                                orgUser: {
                                    select: { displayName: true, email: true },
                                },
                            },
                        },
                    },
                    orderBy: [{ isSub: 'asc' }, { idx: 'asc' }],
                },
            },
        });
    }

    async delete(tenantId: string, lineupId: string) {
        const lineup = await this.prisma.lineup.findFirst({
            where: { id: lineupId, tenantId },
        });

        if (!lineup) {
            throw new NotFoundException('Lineup not found');
        }

        await this.prisma.lineup.delete({
            where: { id: lineupId },
        });

        return { success: true };
    }
}

