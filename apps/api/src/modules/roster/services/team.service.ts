import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import { DiscordService } from '../../discord/discord.service';
import { CreateTeamDto, TeamQueryDto, UpdateTeamDto } from '../dto';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private discordService: DiscordService,
    private readonly auditService: AuditService
  ) {}

  async create(
    tenantId: string,
    createTeamDto: CreateTeamDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    // Validate coach exists if provided
    let coachGlobalUserId: string | null = null;
    if (createTeamDto.coachId) {
      // coachId is actually the globalUserId from the frontend
      coachGlobalUserId = createTeamDto.coachId;
    }

    // Check for duplicate team name within the same season/game
    const existing = await this.prisma.team.findFirst({
      where: {
        tenantId,
        name: createTeamDto.name,
        game: createTeamDto.game,
        season: createTeamDto.season || null,
      },
    });

    if (existing) {
      throw new ConflictException('Team with this name already exists for this game/season');
    }

    const team = await this.prisma.team.create({
      data: {
        name: createTeamDto.name,
        game: createTeamDto.game,
        season: createTeamDto.season || null,
        coachGlobalUserId,
        captainId: createTeamDto.captainId || null,
        tenantId,
      },
      include: {
        coachGlobalUser: {
          select: { id: true, name: true, email: true },
        },
        captain: {
          select: { id: true, gamerTag: true, realName: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.create',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: team.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Created team',
      metadata: {
        name: team.name,
        game: team.game,
        season: team.season,
        coachGlobalUserId: team.coachGlobalUserId,
        captainId: team.captainId,
        actorEmail,
      },
    });

    return team;
  }

  async findMany(tenantId: string, query: TeamQueryDto) {
    const where: any = { tenantId };

    if (query.game) {
      where.game = query.game;
    }
    if (query.season) {
      where.season = query.season;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { game: { contains: query.q, mode: 'insensitive' } },
        { season: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.team.findMany({
      where,
      include: {
        coachGlobalUser: {
          select: { id: true, name: true, email: true },
        },
        captain: {
          select: { id: true, gamerTag: true, realName: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, tenantId },
      include: {
        coachGlobalUser: {
          select: { id: true, name: true, email: true },
        },
        captain: {
          select: { id: true, gamerTag: true, realName: true },
        },
        members: {
          include: {
            player: {
              select: {
                id: true,
                gamerTag: true,
                role: true,
                rank: true,
                eligibility: true,
                isActive: true,
                globalUser: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
          orderBy: [{ isStarter: 'desc' }, { position: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: {
            members: true,
            lineups: true,
            achievements: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(
    tenantId: string,
    id: string,
    updateTeamDto: UpdateTeamDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    // Check if team exists
    const existing = await this.prisma.team.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Team not found');
    }

    // Validate coach exists if provided
    if (updateTeamDto.coachId) {
      // coachId is actually the globalUserId from the frontend
      updateTeamDto['coachGlobalUserId'] = updateTeamDto.coachId;
    }

    // Validate captain exists if provided (ignore empty strings)
    if (updateTeamDto.captainId && updateTeamDto.captainId.trim() !== '') {
      const captain = await this.prisma.player.findFirst({
        where: { id: updateTeamDto.captainId, tenantId },
      });
      if (!captain) {
        throw new BadRequestException('Captain not found');
      }
    } else if (updateTeamDto.captainId === '') {
      // Convert empty string to null
      updateTeamDto.captainId = null;
    }

    // Check for name conflicts if name is being changed
    if (updateTeamDto.name && updateTeamDto.name !== existing.name) {
      const conflict = await this.prisma.team.findFirst({
        where: {
          tenantId,
          name: updateTeamDto.name,
          game: updateTeamDto.game || existing.game,
          season: updateTeamDto.season || existing.season,
          id: { not: id },
        },
      });

      if (conflict) {
        throw new ConflictException('Team with this name already exists for this game/season');
      }
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
      include: {
        coachGlobalUser: {
          select: { id: true, name: true, email: true },
        },
        captain: {
          select: { id: true, gamerTag: true, realName: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    const changes: Record<string, any> = {};
    const fieldsToTrack = [
      'name',
      'game',
      'season',
      'status',
      'coachGlobalUserId',
      'captainId',
    ] as const;
    fieldsToTrack.forEach(field => {
      const beforeVal = (existing as any)[field];
      const afterVal = (updated as any)[field];
      if (beforeVal !== afterVal) {
        changes[field] = { before: beforeVal, after: afterVal };
      }
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.update',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: updated.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Updated team',
      metadata: {
        before: {
          name: existing.name,
          game: existing.game,
          season: existing.season,
          status: (existing as any).status,
          coachGlobalUserId: (existing as any).coachGlobalUserId ?? null,
          captainId: (existing as any).captainId ?? null,
        },
        after: {
          name: updated.name,
          game: updated.game,
          season: updated.season,
          status: (updated as any).status,
          coachGlobalUserId: (updated as any).coachGlobalUserId ?? null,
          captainId: (updated as any).captainId ?? null,
        },
        changes,
        actorEmail,
      },
    });

    return updated;
  }

  async archive(
    tenantId: string,
    id: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id, tenantId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.status === 'archived') {
      throw new ConflictException('Team is already archived');
    }

    const archived = await this.prisma.team.update({
      where: { id },
      data: { status: 'archived' },
      include: {
        coachGlobalUser: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.archive',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: archived.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Archived team',
      metadata: {
        name: archived.name,
        game: archived.game,
        previousStatus: team.status,
        newStatus: archived.status,
        actorEmail,
      },
    });

    return archived;
  }

  async delete(
    tenantId: string,
    id: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const team = await this.prisma.team.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: {
            members: true,
            lineups: true,
            achievements: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Delete related records first (cascade delete)
    await this.prisma.$transaction([
      // Delete team members
      this.prisma.teamMember.deleteMany({
        where: { teamId: id, tenantId },
      }),
      // Delete lineup slots related to this team's lineups
      this.prisma.lineupSlot.deleteMany({
        where: {
          lineup: {
            teamId: id,
            tenantId,
          },
        },
      }),
      // Delete lineups
      this.prisma.lineup.deleteMany({
        where: { teamId: id, tenantId },
      }),
      // Delete achievements
      this.prisma.achievement.deleteMany({
        where: { teamId: id, tenantId },
      }),
      // Delete matches (gamelog)
      this.prisma.match.deleteMany({
        where: { teamId: id, tenantId },
      }),
      // Finally delete the team
      this.prisma.team.delete({
        where: { id },
      }),
    ]);

    await this.auditService.log({
      tenantId,
      action: 'roster.delete',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: team.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Deleted team',
      metadata: {
        name: team.name,
        game: team.game,
        season: team.season,
        deletedRelations: team._count,
        actorEmail,
      },
    });

    return { message: 'Team deleted successfully' };
  }

  async addMember(
    tenantId: string,
    teamId: string,
    playerId: string,
    isStarter = true,
    position?: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    // Verify team exists
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, tenantId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Verify player exists
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });
    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Check if player is already on team
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { teamId, playerId, tenantId },
    });
    if (existingMember) {
      throw new ConflictException('Player is already on this team');
    }

    const member = await this.prisma.teamMember.create({
      data: {
        tenantId,
        teamId,
        playerId,
        isStarter,
        position,
      },
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
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.member.add',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: team.id,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Added member to team',
      metadata: {
        teamId,
        teamName: team.name,
        playerId,
        playerName: player.gamerTag,
        position: position || member.position,
        isStarter,
        actorEmail,
      },
    });

    // Send Discord notification
    try {
      const affectedGlobalUserIds = player.globalUserId ? [player.globalUserId] : undefined;
      await this.discordService.notifyRoster(
        tenantId,
        {
          type: 'player_added',
          teamName: team.name,
          playerName: player.gamerTag,
          role: position || member.position,
          details: isStarter ? 'Added as starter' : 'Added as substitute',
        },
        affectedGlobalUserIds
      );
    } catch (error) {
      console.error('Failed to send Discord roster notification:', error);
    }

    return member;
  }

  async removeMember(
    tenantId: string,
    teamId: string,
    playerId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const member = await this.prisma.teamMember.findFirst({
      where: { teamId, playerId, tenantId },
      include: {
        team: { select: { name: true } },
        player: { select: { gamerTag: true, globalUserId: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    await this.prisma.teamMember.delete({
      where: { id: member.id },
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.member.remove',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: teamId,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Removed member from team',
      metadata: {
        teamId,
        teamName: member.team.name,
        playerId,
        playerName: member.player.gamerTag,
        actorEmail,
      },
    });

    // Send Discord notification
    try {
      // Get affected player's globalUserId for DM notification
      const affectedGlobalUserIds = member.player.globalUserId
        ? [member.player.globalUserId]
        : undefined;

      await this.discordService.notifyRoster(
        tenantId,
        {
          type: 'player_removed',
          teamName: member.team.name,
          playerName: member.player.gamerTag,
          details: 'Removed from team',
        },
        affectedGlobalUserIds
      );
    } catch (error) {
      // Don't fail the operation if Discord notification fails
      console.error('Failed to send Discord roster notification:', error);
    }

    return member;
  }

  async updateMember(
    tenantId: string,
    teamId: string,
    playerId: string,
    isStarter?: boolean,
    position?: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    const member = await this.prisma.teamMember.findFirst({
      where: { teamId, playerId, tenantId },
      include: {
        team: { select: { name: true } },
        player: { select: { gamerTag: true, globalUserId: true } },
      },
    });

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    const updateData: any = {};
    if (isStarter !== undefined) updateData.isStarter = isStarter;
    if (position !== undefined) updateData.position = position;

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: member.id },
      data: updateData,
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
    });

    await this.auditService.log({
      tenantId,
      action: 'roster.member.update',
      entity: 'roster',
      entityType: 'ORG_USER',
      entityId: teamId,
      orgUserId: await this.resolveActorOrgUserId(tenantId, actorOrgUserId, actorEmail),
      description: 'Updated team member',
      metadata: {
        teamId,
        teamName: member.team.name,
        playerId,
        playerName: member.player.gamerTag,
        before: {
          isStarter: member.isStarter,
          position: member.position,
        },
        after: {
          isStarter: updatedMember.isStarter,
          position: updatedMember.position,
        },
        changes: {
          ...(isStarter !== undefined && isStarter !== member.isStarter
            ? { isStarter: { before: member.isStarter, after: updatedMember.isStarter } }
            : {}),
          ...(position !== undefined && position !== member.position
            ? { position: { before: member.position, after: updatedMember.position } }
            : {}),
        },
        actorEmail,
      },
    });

    // Send Discord notification for role changes
    if (isStarter !== undefined || position !== undefined) {
      try {
        const changes = [];
        if (position !== undefined) changes.push(`Position: ${position}`);
        if (isStarter !== undefined) changes.push(`Role: ${isStarter ? 'Starter' : 'Substitute'}`);

        // Get affected player's globalUserId for DM notification
        const affectedGlobalUserIds = member.player.globalUserId
          ? [member.player.globalUserId]
          : undefined;

        await this.discordService.notifyRoster(
          tenantId,
          {
            type: 'lineup_changed',
            teamName: member.team.name,
            playerName: member.player.gamerTag,
            details: changes.join(', '),
          },
          affectedGlobalUserIds
        );
      } catch (error) {
        // Don't fail the operation if Discord notification fails
        console.error('Failed to send Discord roster notification:', error);
      }
    }

    return updatedMember;
  }

  async countTeams(tenantId: string): Promise<number> {
    return this.prisma.team.count({
      where: { tenantId },
    });
  }

  private async resolveActorOrgUserId(
    tenantId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    if (actorOrgUserId) {
      const found = await this.prisma.orgUser.findFirst({
        where: { id: actorOrgUserId, tenantId },
        select: { id: true },
      });
      if (found) {
        return actorOrgUserId;
      }
    }

    if (actorEmail) {
      const foundByEmail = await this.prisma.orgUser.findFirst({
        where: { tenantId, email: actorEmail },
        select: { id: true },
      });
      if (foundByEmail) {
        return foundByEmail.id;
      }
    }

    return null;
  }
}
