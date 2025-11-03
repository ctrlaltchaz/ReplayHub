import {
    Controller,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PlayerService } from '../services/player.service';
import { TeamService } from '../services/team.service';

@Controller('org/:slug/rosters')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class RosterController {
    constructor(
        private readonly playerService: PlayerService,
        private readonly teamService: TeamService
    ) { }

    @Get('stats')
    @Can('roster.view')
    async getStats(@Req() req: Request) {
        const totalPlayers = await this.playerService.countPlayers(req.tenant!.id);
        const totalTeams = await this.teamService.countTeams(req.tenant!.id);
        return { totalPlayers, totalTeams };
    }
}
