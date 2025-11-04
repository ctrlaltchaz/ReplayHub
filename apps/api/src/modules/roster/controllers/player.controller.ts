import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PlayerService } from '../services/player.service';

interface CreatePlayerDto {
    gamerTag: string;
    orgUserId?: string;
    role?: string;
    rank?: string;
    mains?: string[];
    bio?: string;
    socials?: Record<string, string>;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
    consent?: Record<string, any>;
}

interface UpdatePlayerDto {
    gamerTag?: string;
    orgUserId?: string;
    role?: string;
    rank?: string;
    mains?: string[];
    bio?: string;
    socials?: Record<string, string>;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
    consent?: Record<string, any>;
    isActive?: boolean;
}

interface PlayerQueryDto {
    q?: string;
    active?: boolean;
    teamId?: string;
    eligibility?: 'eligible' | 'probation' | 'ineligible';
}

interface LinkPlayerToUserDto {
    email?: string;
    userId?: string;
}

interface SetAvailabilityDto {
    date: string;
    status: 'available' | 'unsure' | 'unavailable';
    note?: string;
}

interface AvailabilityQueryDto {
    date: string;
    teamId?: string;
}

@Controller('org/:slug/players')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class PlayerController {
    constructor(private readonly playerService: PlayerService) { }

    @Get('debug-link')
    async debugPlayerLink(@Req() req: Request) {
        const globalUserId = req.globalUser?.id;
        const tenantId = req.tenant!.id;

        // Get all players with their orgUser info
        const allPlayers = await this.playerService['prisma'].player.findMany({
            where: { tenantId },
            select: {
                id: true,
                gamerTag: true,
                orgUserId: true,
                orgUser: {
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                        globalUserId: true,
                    }
                }
            }
        });

        return {
            requestInfo: {
                globalUserId,
                tenantId,
            },
            allPlayers,
            message: 'Debug info for player linking'
        };
    }

    @Get('me')
    async getMyPlayer(@Req() req: Request) {
        const globalUserId = req.globalUser?.id;
        if (!globalUserId) {
            return { player: null };
        }
        const player = await this.playerService.findPlayerByGlobalUser(req.tenant!.id, globalUserId);
        return { player };
    }

    @Get('stats')
    @Can('roster.view')
    async getStats(@Req() req: Request) {
        const totalPlayers = await this.playerService.countPlayers(req.tenant!.id);
        return { totalPlayers };
    }

    @Post()
    @Can('player.create')
    async create(
        @Req() req: Request,
        @Body() createPlayerDto: CreatePlayerDto,
    ) {
        return this.playerService.create(req.tenant!.id, createPlayerDto);
    }

    @Get()
    @Can('roster.view')
    async findAll(
        @Req() req: Request,
        @Query() query: PlayerQueryDto,
    ) {
        return this.playerService.findMany(req.tenant!.id, query);
    }

    @Get('availability')
    @Can('availability.manage')
    async getAvailability(
        @Req() req: Request,
        @Query() query: AvailabilityQueryDto,
    ) {
        return this.playerService.getAvailability(
            req.tenant!.id,
            query.date,
            query.teamId,
        );
    }

    @Get(':id')
    @Can('roster.view')
    async findOne(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.playerService.findOne(req.tenant!.id, id);
    }

    @Put(':id')
    @Can('player.update')
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updatePlayerDto: UpdatePlayerDto,
    ) {
        return this.playerService.update(req.tenant!.id, id, updatePlayerDto);
    }

    @Delete(':id')
    @Can('player.delete')
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.playerService.delete(req.tenant!.id, id);
    }

    @Post(':id/link-user')
    @Can('player.link_user')
    async linkToUser(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() linkData: LinkPlayerToUserDto,
    ) {
        return this.playerService.linkToUser(req.tenant!.id, id, linkData);
    }

    @Delete(':id/link-user')
    @Can('player.link_user')
    async unlinkFromUser(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.playerService.unlinkFromUser(req.tenant!.id, id);
    }

    @Post(':id/availability')
    @Can('availability.set_self') // This will need additional logic to check if it's self or manage
    async setAvailability(
        @Req() req: Request,
        @Param('id') playerId: string,
        @Body() availabilityDto: SetAvailabilityDto,
    ) {
        return this.playerService.setAvailability(
            req.tenant!.id,
            playerId,
            availabilityDto.date,
            availabilityDto.status,
            availabilityDto.note,
        );
    }

    @Put(':id/my-profile')
    async updateMyProfile(
        @Req() req: Request,
        @Param('id') playerId: string,
        @Body() updateDto: UpdatePlayerDto,
    ) {
        const globalUserId = req.globalUser?.id;
        if (!globalUserId) {
            throw new Error('User not authenticated');
        }
        // Verify the player belongs to the current user
        return this.playerService.updatePlayerProfile(
            req.tenant!.id,
            playerId,
            globalUserId,
            updateDto,
        );
    }

    @Patch(':id/settings')
    async updatePlayerSettings(
        @Req() req: Request,
        @Param('id') playerId: string,
        @Body() body: { statsVisible?: boolean },
    ) {
        const globalUserId = req.globalUser?.id;
        if (!globalUserId) {
            throw new Error('User not authenticated');
        }
        // Only allow player to update their own settings
        return this.playerService.updatePlayerSettings(
            req.tenant!.id,
            playerId,
            globalUserId,
            body,
        );
    }

    @Post(':id/sync-user-data')
    async syncUserData(
        @Req() req: Request,
        @Param('id') playerId: string,
    ) {
        const globalUserId = req.globalUser?.id;
        if (!globalUserId) {
            throw new Error('User not authenticated');
        }
        // Sync user data to player profile
        return this.playerService.syncUserDataToPlayer(
            req.tenant!.id,
            playerId,
            globalUserId,
        );
    }

    @Get(':id/game-stats')
    @Can('roster.view')
    async getPlayerGameStats(
        @Req() req: Request,
        @Param('id') playerId: string,
    ) {
        const globalUserId = req.globalUser?.id;
        return this.playerService.getPlayerGameStats(req.tenant!.id, playerId, globalUserId);
    }

}