import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
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
import { AchievementService } from '../services/achievement.service';

interface CreateAchievementDto {
    teamId?: string;
    playerId?: string;
    title: string;
    eventRef?: string;
    date: string;
    details?: string;
}

interface AchievementQueryDto {
    teamId?: string;
    playerId?: string;
    from?: string;
    to?: string;
}

@Controller('org/:slug/achievements')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class AchievementController {
    constructor(private readonly achievementService: AchievementService) { }

    @Post()
    @Can('achievement.create')
    async create(
        @Req() req: Request,
        @Body() createAchievementDto: CreateAchievementDto,
    ) {
        return this.achievementService.create(req.tenant!.id, createAchievementDto);
    }

    @Get()
    @Can('roster.view')
    async findAll(
        @Req() req: Request,
        @Query() query: AchievementQueryDto,
    ) {
        return this.achievementService.findMany(req.tenant!.id, query);
    }

    @Get(':id')
    @Can('roster.view')
    async findOne(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.achievementService.findOne(req.tenant!.id, id);
    }

    @Put(':id')
    @Can('achievement.approve')
    async update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateData: Partial<CreateAchievementDto>,
    ) {
        return this.achievementService.update(req.tenant!.id, id, updateData);
    }

    @Delete(':id')
    @Can('achievement.approve')
    async delete(
        @Req() req: Request,
        @Param('id') id: string,
    ) {
        return this.achievementService.delete(req.tenant!.id, id);
    }

    @Get('teams/:teamId')
    @Can('roster.view')
    async getTeamAchievements(
        @Req() req: Request,
        @Param('teamId') teamId: string,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.achievementService.getTeamAchievements(req.tenant!.id, teamId, limitNum);
    }

    @Get('players/:playerId')
    @Can('roster.view')
    async getPlayerAchievements(
        @Req() req: Request,
        @Param('playerId') playerId: string,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.achievementService.getPlayerAchievements(req.tenant!.id, playerId, limitNum);
    }

    @Get('recent')
    @Can('roster.view')
    async getRecentAchievements(
        @Req() req: Request,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.achievementService.getRecentAchievements(req.tenant!.id, limitNum);
    }
}