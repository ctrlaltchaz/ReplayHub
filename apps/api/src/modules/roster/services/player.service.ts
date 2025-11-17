import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreatePlayerDto, LinkPlayerToUserDto, PlayerQueryDto, UpdatePlayerDto } from '../dto';

@Injectable()
export class PlayerService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createPlayerDto: CreatePlayerDto) {

        // Check for duplicate gamer tag
        const existing = await this.prisma.player.findFirst({
            where: {
                tenantId,
                gamerTag: createPlayerDto.gamerTag,
            },
        });

        if (existing) {
            throw new ConflictException('Gamer tag already exists');
        }

        const { mains, socials, consent, teamId, ...playerData } = createPlayerDto;

        const player = await this.prisma.player.create({
            data: {
                gamerTag: playerData.gamerTag,
                realName: playerData.realName || null,
                globalUserId: null, // Will be set via linkPlayerToUser
                role: playerData.role || null,
                rank: playerData.rank || null,
                bio: playerData.bio || null,
                eligibility: playerData.eligibility || null,
                tenantId,
                mainsJson: mains || [],
                socialsJson: socials || {},
                consentJson: consent || {},
            },
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: {
                        teams: true,
                        achievements: true,
                    },
                },
            },
        });

        // If teamId is provided, add player to team
        if (teamId) {
            await this.prisma.teamMember.create({
                data: {
                    tenantId,
                    teamId,
                    playerId: player.id,
                    isStarter: true,
                },
            });
        }

        return player;
    }

    async findMany(tenantId: string, query: PlayerQueryDto) {
        const where: any = { tenantId };

        if (query.active !== undefined) {
            // Convert string to boolean if needed
            const isActive = typeof query.active === 'string'
                ? query.active === 'true'
                : query.active;
            where.isActive = isActive;
        }
        if (query.eligibility) {
            where.eligibility = query.eligibility;
        }
        if (query.teamId) {
            where.teams = {
                some: { teamId: query.teamId },
            };
        }
        if (query.q) {
            where.OR = [
                { gamerTag: { contains: query.q, mode: 'insensitive' } },
                { role: { contains: query.q, mode: 'insensitive' } },
                { rank: { contains: query.q, mode: 'insensitive' } },
                { globalUser: { name: { contains: query.q, mode: 'insensitive' } } },
            ];
        }

        return this.prisma.player.findMany({
            where,
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                teams: {
                    include: {
                        team: {
                            select: { id: true, name: true, game: true, season: true },
                        },
                    },
                },
                _count: {
                    select: {
                        teams: true,
                        achievements: true,
                    },
                },
            },
            orderBy: [{ isActive: 'desc' }, { gamerTag: 'asc' }],
        });
    }

    async findOne(tenantId: string, id: string) {
        const player = await this.prisma.player.findFirst({
            where: { id, tenantId },
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                teams: {
                    include: {
                        team: {
                            select: { id: true, name: true, game: true, season: true, status: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                achievements: {
                    orderBy: { date: 'desc' },
                    take: 10,
                },
                availability: {
                    where: {
                        date: { gte: new Date() },
                    },
                    orderBy: { date: 'asc' },
                    take: 10,
                },
                _count: {
                    select: {
                        teams: true,
                        achievements: true,
                        availability: true,
                        lineupSlots: true,
                    },
                },
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        // Parse JSON fields for response
        return {
            ...player,
            mains: player.mainsJson as string[],
            socials: player.socialsJson as Record<string, string>,
            consent: player.consentJson as Record<string, any>,
        };
    }

    async findPlayerByGlobalUser(tenantId: string, globalUserId: string) {
        if (!globalUserId) {
            return null;
        }

        const player = await this.prisma.player.findFirst({
            where: {
                tenantId,
                globalUserId,
            },
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                teams: {
                    include: {
                        team: {
                            select: { id: true, name: true, game: true, season: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return player;
    }

    async update(tenantId: string, id: string, updatePlayerDto: UpdatePlayerDto) {
        // Check if player exists
        const existing = await this.prisma.player.findFirst({
            where: { id, tenantId },
        });

        if (!existing) {
            throw new NotFoundException('Player not found');
        }

        // Check for gamer tag conflicts if gamer tag is being changed
        if (updatePlayerDto.gamerTag && updatePlayerDto.gamerTag !== existing.gamerTag) {
            const conflict = await this.prisma.player.findFirst({
                where: {
                    tenantId,
                    gamerTag: updatePlayerDto.gamerTag,
                    id: { not: id },
                },
            });

            if (conflict) {
                throw new ConflictException('Gamer tag already exists');
            }
        }

        const { mains, socials, consent, teamId, ...playerData } = updatePlayerDto;
        const updateData: any = { ...playerData };

        if (mains !== undefined) updateData.mainsJson = mains;
        if (socials !== undefined) updateData.socialsJson = socials;
        if (consent !== undefined) updateData.consentJson = consent;

        const updatedPlayer = await this.prisma.player.update({
            where: { id },
            data: updateData,
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: {
                        teams: true,
                        achievements: true,
                    },
                },
            },
        });

        // Handle team change if teamId is provided
        if (teamId !== undefined) {
            if (teamId === '') {
                // Remove from all teams if empty string
                await this.prisma.teamMember.deleteMany({
                    where: { playerId: id, tenantId },
                });
            } else {
                // Verify team exists
                const team = await this.prisma.team.findFirst({
                    where: { id: teamId, tenantId },
                });
                if (!team) {
                    throw new BadRequestException('Team not found');
                }

                // Check if player is already on this team
                const existingMembership = await this.prisma.teamMember.findFirst({
                    where: { playerId: id, teamId, tenantId },
                });

                if (!existingMembership) {
                    // Remove from all other teams and add to this team
                    await this.prisma.teamMember.deleteMany({
                        where: { playerId: id, tenantId },
                    });
                    await this.prisma.teamMember.create({
                        data: {
                            tenantId,
                            teamId,
                            playerId: id,
                            isStarter: true,
                        },
                    });
                }
            }
        }

        // Parse JSON fields for response
        return {
            ...updatedPlayer,
            mains: updatedPlayer.mainsJson as string[],
            socials: updatedPlayer.socialsJson as Record<string, string>,
            consent: updatedPlayer.consentJson as Record<string, any>,
        };
    }

    async delete(tenantId: string, id: string) {
        const player = await this.prisma.player.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: {
                        teams: true,
                        achievements: true,
                        availability: true,
                        lineupSlots: true,
                    },
                },
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        // Delete related records first (cascade delete)
        await this.prisma.$transaction([
            // Delete team memberships
            this.prisma.teamMember.deleteMany({
                where: { playerId: id, tenantId },
            }),
            // Delete achievements
            this.prisma.achievement.deleteMany({
                where: { playerId: id, tenantId },
            }),
            // Delete availability records
            this.prisma.availability.deleteMany({
                where: { playerId: id, tenantId },
            }),
            // Delete lineup slots
            this.prisma.lineupSlot.deleteMany({
                where: { playerId: id, tenantId },
            }),
            // Finally delete the player
            this.prisma.player.delete({
                where: { id },
            }),
        ]);

        return { message: 'Player deleted successfully' };
    }

    async linkToUser(tenantId: string, id: string, linkData: LinkPlayerToUserDto) {
        // Find the player
        const player = await this.prisma.player.findFirst({
            where: { id, tenantId },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (player.globalUserId) {
            throw new ConflictException('Player is already linked to a user');
        }

        // Find the global user data
        let globalUser;
        if (linkData.userId) {
            // Assume userId is globalUserId
            globalUser = await this.prisma.globalUser.findUnique({
                where: { id: linkData.userId },
                select: {
                    id: true,
                    name: true,
                    bio: true,
                    avatar: true,
                    socialLinks: true,
                    email: true,
                },
            });
        } else if (linkData.email) {
            globalUser = await this.prisma.globalUser.findUnique({
                where: { email: linkData.email },
                select: {
                    id: true,
                    name: true,
                    bio: true,
                    avatar: true,
                    socialLinks: true,
                    email: true,
                },
            });
        }

        if (!globalUser) {
            throw new NotFoundException('Global user not found');
        }

        // Check if user is already linked to another player
        const existingPlayer = await this.prisma.player.findFirst({
            where: {
                globalUserId: globalUser.id,
                tenantId,
            },
        });

        if (existingPlayer) {
            throw new ConflictException('This user is already linked to another player');
        }

        // Prepare data sync from user to player
        const updateData: any = {
            globalUserId: globalUser.id
        };

        // Sync user data to player if available
        if (globalUser.name && !player.realName) {
            updateData.realName = globalUser.name;
        }
        if (globalUser.avatar && !player.avatar) {
            updateData.avatar = globalUser.avatar;
        }
        if (globalUser.bio && !player.bio) {
            updateData.bio = globalUser.bio;
        }
        if (globalUser.socialLinks && (!player.socialsJson || JSON.stringify(player.socialsJson) === '{}')) {
            updateData.socialsJson = globalUser.socialLinks;
        }

        return this.prisma.player.update({
            where: { id },
            data: updateData,
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }

    async unlinkFromUser(tenantId: string, id: string) {
        const player = await this.prisma.player.findFirst({
            where: { id, tenantId },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (!player.globalUserId) {
            throw new BadRequestException('Player is not linked to any user');
        }

        return this.prisma.player.update({
            where: { id },
            data: {
                globalUserId: null
            },
        });
    }

    async setAvailability(tenantId: string, playerId: string, date: string, status: string, note?: string) {
        // Verify player exists
        const player = await this.prisma.player.findFirst({
            where: { id: playerId, tenantId },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        const parsedDate = new Date(date);

        return this.prisma.availability.upsert({
            where: {
                tenantId_playerId_date: {
                    tenantId,
                    playerId,
                    date: parsedDate,
                },
            },
            update: {
                status,
                note,
            },
            create: {
                tenantId,
                playerId,
                date: parsedDate,
                status,
                note,
            },
        });
    }

    async getAvailability(tenantId: string, date: string, teamId?: string) {
        // Simple fixed implementation that works
        console.log('� NEW AVAILABILITY METHOD CALLED:', { tenantId, date, teamId });

        const parsedDate = new Date(date);

        if (teamId) {
            console.log('� Team-specific query for teamId:', teamId);

            // Get all team members first
            const teamMembers = await this.prisma.teamMember.findMany({
                where: {
                    teamId,
                    team: { tenantId },
                },
                include: {
                    player: {
                        select: {
                            id: true,
                            gamerTag: true,
                            role: true,
                        },
                    },
                },
                orderBy: { player: { gamerTag: 'asc' } },
            });

            console.log('🚀 Found team members:', teamMembers.length);

            if (teamMembers.length === 0) {
                console.log('🚀 No team members found, returning empty array');
                return [];
            }

            const playerIds = teamMembers.map(tm => tm.playerId);
            console.log('🚀 Player IDs:', playerIds);

            // Get availability records for these players
            const availabilityRecords = await this.prisma.availability.findMany({
                where: {
                    tenantId,
                    playerId: { in: playerIds },
                    date: parsedDate,
                },
            });

            console.log('🚀 Found availability records:', availabilityRecords.length);

            // Create map of availability by player ID
            const availabilityMap = new Map();
            availabilityRecords.forEach(record => {
                availabilityMap.set(record.playerId, {
                    status: record.status,
                    note: record.note
                });
            });

            // Return data for all team members (with null for missing availability)
            const result = teamMembers.map(tm => {
                const availability = availabilityMap.get(tm.playerId);
                return {
                    id: `${tm.playerId}-${date}`,
                    tenantId,
                    playerId: tm.playerId,
                    date: parsedDate,
                    status: availability ? availability.status : null,
                    note: availability ? availability.note : null,
                    player: {
                        id: tm.player.id,
                        gamerTag: tm.player.gamerTag,
                        role: tm.player.role,
                        teams: [{
                            isStarter: tm.isStarter,
                            position: tm.position,
                        }],
                    },
                };
            });

            console.log('🚀 Returning result with', result.length, 'items');
            return result;
        }

        // For non-team queries, return existing availability records
        console.log('� General availability query');
        const result = await this.prisma.availability.findMany({
            where: {
                tenantId,
                date: parsedDate,
            },
            include: {
                player: {
                    select: {
                        id: true,
                        gamerTag: true,
                        role: true,
                    },
                },
            },
            orderBy: { player: { gamerTag: 'asc' } },
        });

        console.log('🚀 General query returning', result.length, 'records');
        return result;
    }


    async countPlayers(tenantId: string): Promise<number> {
        try {
            const count = await this.prisma.player.count({
                where: { tenantId }
            });
            return count;
        } catch (error) {
            console.error('Failed to count players:', error);
            return 0;
        }
    }

    async updatePlayerProfile(tenantId: string, playerId: string, globalUserId: string, updateDto: UpdatePlayerDto) {
        // First verify this player belongs to this user
        const player = await this.prisma.player.findFirst({
            where: {
                id: playerId,
                tenantId,
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (!player.globalUserId || player.globalUserId !== globalUserId) {
            throw new BadRequestException('You can only update your own player profile');
        }

        const { mains, socials, consent, ...playerData } = updateDto;

        return this.prisma.player.update({
            where: { id: playerId },
            data: {
                gamerTag: playerData.gamerTag || player.gamerTag,
                realName: playerData.realName !== undefined ? playerData.realName : player.realName,
                role: playerData.role !== undefined ? playerData.role : player.role,
                rank: playerData.rank !== undefined ? playerData.rank : player.rank,
                bio: playerData.bio !== undefined ? playerData.bio : player.bio,
                mainsJson: mains !== undefined ? mains : player.mainsJson,
                socialsJson: socials !== undefined ? socials : player.socialsJson,
            },
            include: {
                globalUser: {
                    select: { id: true, name: true, email: true },
                },
                teams: {
                    include: {
                        team: {
                            select: { id: true, name: true, game: true },
                        },
                    },
                },
            },
        });
    }

    async updatePlayerSettings(
        tenantId: string,
        playerId: string,
        globalUserId: string,
        settings: { statsVisible?: boolean },
    ) {
        // First verify this player belongs to this user
        const player = await this.prisma.player.findFirst({
            where: {
                id: playerId,
                tenantId,
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (!player.globalUserId || player.globalUserId !== globalUserId) {
            throw new BadRequestException('You can only update your own player settings');
        }

        // Update the settings
        return this.prisma.player.update({
            where: { id: playerId },
            data: {
                statsVisible: settings.statsVisible,
            },
            select: {
                id: true,
                gamerTag: true,
                statsVisible: true,
            },
        });
    }

    async syncUserDataToPlayer(
        tenantId: string,
        playerId: string,
        globalUserId: string,
    ) {
        // Verify the player belongs to the requesting user
        const player = await this.prisma.player.findFirst({
            where: {
                id: playerId,
                tenantId: tenantId,
                globalUserId: globalUserId,
            },
            include: {
                globalUser: true,
            },
        });

        if (!player) {
            throw new Error('Player not found or access denied');
        }

        // Sync data from globalUser to player
        const globalUser = player.globalUser;
        if (!globalUser) {
            throw new Error('Player has no linked global user');
        }

        const updateData: any = {};

        if (globalUser.name) {
            updateData.realName = globalUser.name;
        }
        if (globalUser.bio) {
            updateData.bio = globalUser.bio;
        }
        if (globalUser.avatar) {
            updateData.avatar = globalUser.avatar;
        }
        if (globalUser.socialLinks) {
            updateData.socialsJson = globalUser.socialLinks;
        }

        // Update player with synced data
        return this.prisma.player.update({
            where: { id: playerId },
            data: updateData,
            include: {
                globalUser: true,
                teams: {
                    include: {
                        team: true,
                    },
                },
            },
        });
    }

    async getPlayerGameStats(tenantId: string, playerId: string, requestingUserId?: string) {
        console.log('[getPlayerGameStats] Called with:', { tenantId, playerId, requestingUserId });

        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            // Verify player exists and get statsVisible setting
            const player = await tx.player.findFirst({
                where: { id: playerId, tenantId },
            });

            console.log('[getPlayerGameStats] Player found:', player ? { id: player.id, gamerTag: player.gamerTag, statsVisible: player.statsVisible, globalUserId: player.globalUserId } : null);

            if (!player) {
                throw new NotFoundException('Player not found');
            }

            // Check if stats are private
            if (player.statsVisible === false) {
                // Allow player to view their own stats
                const isOwnPlayer = player.globalUserId === requestingUserId;

                console.log('[getPlayerGameStats] Stats private check:', { statsVisible: player.statsVisible, isOwnPlayer });

                if (!isOwnPlayer) {
                    // TODO: Add admin/coach bypass check here
                    // For now, return null if stats are private and not own player
                    console.log('[getPlayerGameStats] Returning null - stats are private');
                    return null;
                }
            }

            // Get all player stats for this player
            let stats;
            try {
                stats = await tx.playerStat.findMany({
                    where: {
                        tenantId,
                        playerId
                    },
                    include: {
                        match: {
                            include: {
                                team: true
                            }
                        },
                        mapGame: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                });
                console.log('[getPlayerGameStats] Stats query result:', { count: stats.length });

                // Filter out stats where match is null (RLS blocked or deleted)
                stats = stats.filter(s => s.match !== null);
                console.log('[getPlayerGameStats] Stats after filtering null matches:', { count: stats.length });
            } catch (error) {
                console.error('[getPlayerGameStats] Query ERROR:', error);
                throw error;
            }

            if (stats.length === 0) {
                console.log('[getPlayerGameStats] Returning null - no stats found');
                return null;
            }

            // Calculate aggregated statistics
            const totalGames = stats.length;
            const totalMvps = stats.filter(s => s.isMvp).length;
            const avgRating = stats.reduce((sum, s) => sum + (s.rating || 0), 0) / totalGames;

            // Get unique matches
            const uniqueMatches = new Set(stats.map(s => s.matchId));
            const totalMatches = uniqueMatches.size;

            // Calculate game-specific stats
            const gameStats: Record<string, any> = {};

            stats.forEach(stat => {
                const gameTitle = stat.mapGame?.title || stat.match?.team?.game || 'Unknown';

                if (!gameStats[gameTitle]) {
                    gameStats[gameTitle] = {
                        gamesPlayed: 0,
                        totalKills: 0,
                        totalDeaths: 0,
                        totalAssists: 0,
                        mvps: 0,
                        avgRating: 0,
                        ratingSum: 0
                    };
                }

                const gs = gameStats[gameTitle];
                gs.gamesPlayed++;
                gs.mvps += stat.isMvp ? 1 : 0;
                gs.ratingSum += stat.rating || 0;

                // Extract common stats from statsJson
                const json = stat.statsJson as any;
                if (json) {
                    gs.totalKills += json.kills || json.eliminations || 0;
                    gs.totalDeaths += json.deaths || 0;
                    gs.totalAssists += json.assists || 0;
                }
            });

            // Calculate averages for each game
            Object.keys(gameStats).forEach(gameTitle => {
                const gs = gameStats[gameTitle];
                gs.avgRating = parseFloat((gs.ratingSum / gs.gamesPlayed).toFixed(2));
                gs.kda = gs.totalDeaths > 0
                    ? parseFloat(((gs.totalKills + gs.totalAssists) / gs.totalDeaths).toFixed(2))
                    : parseFloat((gs.totalKills + gs.totalAssists).toFixed(2));
                delete gs.ratingSum; // Remove intermediate calculation
            });

            // Get recent matches (last 5)
            const recentMatches = await tx.match.findMany({
                where: {
                    tenantId,
                    id: { in: Array.from(uniqueMatches) as string[] }
                },
                include: {
                    team: true,
                    playerStats: {
                        where: { playerId },
                        include: { mapGame: true }
                    }
                },
                orderBy: {
                    startedAt: 'desc'
                },
                take: 5
            });

            const recentPerformance = recentMatches.map((match: any) => ({
                matchId: match.id,
                teamName: match.team?.name,
                opponent: match.opponent,
                result: match.result,
                date: match.startedAt,
                avgRating: match.playerStats?.length > 0
                    ? parseFloat((match.playerStats.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / match.playerStats.length).toFixed(2))
                    : 0,
                mvp: match.playerStats?.some((s: any) => s.isMvp) || false
            }));

            return {
                playerId,
                totalGames,
                totalMatches,
                totalMvps,
                avgRating: parseFloat(avgRating.toFixed(2)),
                gameBreakdown: gameStats,
                recentPerformance
            };
        });
    }
}
