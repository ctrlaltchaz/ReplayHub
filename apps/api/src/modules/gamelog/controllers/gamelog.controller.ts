import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Request,
    Res,
    StreamableFile,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import {
    ApproveMatchDto,
    BulkCreateMapGamesDto,
    BulkCreatePlayerStatsDto,
    ComputeStatsDto,
    CreateMatchDto,
    MapGameResponse,
    MatchResponse,
    PlayerStatResponse,
    QueryMatchesDto,
    SubmitMatchDto,
    UnapproveMatchDto,
    UpdateMapGameDto,
    UpdateMatchDto,
    UpdatePlayerStatDto
} from '../dto/gamelog.dto';
import { CsvExportService } from '../services/export/csv-export.service';
import { PdfExportService } from '../services/export/pdf-export.service';
import { GameLogService } from '../services/gamelog.service';
import { MapGameService } from '../services/mapgame.service';
import { PlayerStatService } from '../services/playerstat.service';

@ApiTags('GameLog')
@Controller('org/:slug/gamelog')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class GameLogController {
    constructor(
        private gameLogService: GameLogService,
        private mapGameService: MapGameService,
        private playerStatService: PlayerStatService,
        private pdfExportService: PdfExportService,
        private csvExportService: CsvExportService,
    ) { }

    // ===== MATCH ENDPOINTS =====

    @Post('matches')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Create a new match' })
    @ApiResponse({ status: 201, description: 'Match created successfully' })
    async createMatch(
        @Request() req: any,
        @Body() dto: CreateMatchDto,
    ): Promise<MatchResponse> {
        return this.gameLogService.createMatch(req.tenant.id, req.orgUser.id, dto);
    }

    @Get('matches')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get matches with filters and pagination' })
    @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
    async findMatches(
        @Request() req: any,
        @Query() query: QueryMatchesDto,
    ) {
        return this.gameLogService.findMatches(req.tenant.id, query);
    }

    @Get('matches/:id')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get match by ID with full details' })
    @ApiResponse({ status: 200, description: 'Match retrieved successfully' })
    async findMatchById(
        @Request() req: any,
        @Param('id') matchId: string,
    ): Promise<MatchResponse> {
        return this.gameLogService.findMatchById(req.tenant.id, matchId);
    }

    @Put('matches/:id')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Update match metadata' })
    @ApiResponse({ status: 200, description: 'Match updated successfully' })
    async updateMatch(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: UpdateMatchDto,
    ): Promise<MatchResponse> {
        return this.gameLogService.updateMatch(req.tenant.id, matchId, dto);
    }

    @Delete('matches/:id')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Delete match (if not approved)' })
    @ApiResponse({ status: 204, description: 'Match deleted successfully' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMatch(
        @Request() req: any,
        @Param('id') matchId: string,
    ): Promise<void> {
        return this.gameLogService.deleteMatch(req.tenant.id, matchId);
    }

    @Post('matches/:id/submit')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Submit match for approval' })
    @ApiResponse({ status: 200, description: 'Match submitted successfully' })
    async submitMatch(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: SubmitMatchDto,
    ): Promise<MatchResponse> {
        return this.gameLogService.submitMatch(req.tenant.id, matchId, dto.notes);
    }

    @Post('matches/:id/approve')
    @Can('gamelog.approve')
    @ApiOperation({ summary: 'Approve match and lock editing' })
    @ApiResponse({ status: 200, description: 'Match approved successfully' })
    async approveMatch(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: ApproveMatchDto,
    ): Promise<MatchResponse> {
        return this.gameLogService.approveMatch(req.tenant.id, matchId, dto.notes, dto.forceApprove);
    }

    @Post('matches/:id/unapprove')
    @Can('gamelog.approve')
    @ApiOperation({ summary: 'Unapprove match (ops_admin only)' })
    @ApiResponse({ status: 200, description: 'Match unapproved successfully' })
    async unapproveMatch(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: UnapproveMatchDto,
    ): Promise<MatchResponse> {
        return this.gameLogService.unapproveMatch(req.tenant.id, matchId, dto.reason);
    }

    // ===== MAP GAME ENDPOINTS =====

    @Post('matches/:id/maps')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Add maps to match (bulk create/replace)' })
    @ApiResponse({ status: 201, description: 'Maps added successfully' })
    async bulkCreateMaps(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: BulkCreateMapGamesDto,
    ): Promise<MapGameResponse[]> {
        return this.mapGameService.bulkCreateMapGames(req.tenant.id, matchId, dto);
    }

    @Get('matches/:id/maps')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get all maps for a match' })
    @ApiResponse({ status: 200, description: 'Maps retrieved successfully' })
    async findMapsByMatch(
        @Request() req: any,
        @Param('id') matchId: string,
    ): Promise<MapGameResponse[]> {
        return this.mapGameService.findMapsByMatch(req.tenant.id, matchId);
    }

    @Get('maps/:mapId')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get map by ID' })
    @ApiResponse({ status: 200, description: 'Map retrieved successfully' })
    async findMapById(
        @Request() req: any,
        @Param('mapId') mapId: string,
    ): Promise<MapGameResponse> {
        return this.mapGameService.findMapById(req.tenant.id, mapId);
    }

    @Put('maps/:mapId')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Update map details' })
    @ApiResponse({ status: 200, description: 'Map updated successfully' })
    async updateMap(
        @Request() req: any,
        @Param('mapId') mapId: string,
        @Body() dto: UpdateMapGameDto,
    ): Promise<MapGameResponse> {
        return this.mapGameService.updateMapGame(req.tenant.id, mapId, dto);
    }

    @Delete('maps/:mapId')
    @Can('gamelog.manage')
    @ApiOperation({ summary: 'Delete map and resequence remaining maps' })
    @ApiResponse({ status: 204, description: 'Map deleted successfully' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteMap(
        @Request() req: any,
        @Param('mapId') mapId: string,
    ): Promise<void> {
        return this.mapGameService.deleteMapGame(req.tenant.id, mapId);
    }

    // ===== PLAYER STATS ENDPOINTS =====

    @Post('matches/:id/stats')
    @Can('stats.record')
    @ApiOperation({ summary: 'Add player statistics (bulk upsert)' })
    @ApiResponse({ status: 201, description: 'Player stats added successfully' })
    async bulkCreatePlayerStats(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: BulkCreatePlayerStatsDto,
    ): Promise<PlayerStatResponse[]> {
        return this.playerStatService.bulkCreatePlayerStats(req.tenant.id, matchId, dto);
    }

    @Get('matches/:id/stats')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get all player stats for a match' })
    @ApiResponse({ status: 200, description: 'Player stats retrieved successfully' })
    async findStatsByMatch(
        @Request() req: any,
        @Param('id') matchId: string,
    ): Promise<PlayerStatResponse[]> {
        return this.playerStatService.findStatsByMatch(req.tenant.id, matchId);
    }

    @Get('stats/:statId')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Get player stat by ID' })
    @ApiResponse({ status: 200, description: 'Player stat retrieved successfully' })
    async findStatById(
        @Request() req: any,
        @Param('statId') statId: string,
    ): Promise<PlayerStatResponse> {
        return this.playerStatService.findStatById(req.tenant.id, statId);
    }

    @Put('stats/:statId')
    @Can('stats.edit')
    @ApiOperation({ summary: 'Update player statistics' })
    @ApiResponse({ status: 200, description: 'Player stat updated successfully' })
    async updatePlayerStat(
        @Request() req: any,
        @Param('statId') statId: string,
        @Body() dto: UpdatePlayerStatDto,
    ): Promise<PlayerStatResponse> {
        return this.playerStatService.updatePlayerStat(req.tenant.id, statId, dto);
    }

    @Delete('stats/:statId')
    @Can('stats.edit')
    @ApiOperation({ summary: 'Delete player statistics' })
    @ApiResponse({ status: 204, description: 'Player stat deleted successfully' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async deletePlayerStat(
        @Request() req: any,
        @Param('statId') statId: string,
    ): Promise<void> {
        return this.playerStatService.deletePlayerStat(req.tenant.id, statId);
    }

    @Post('matches/:id/stats/compute')
    @Can('stats.edit')
    @ApiOperation({ summary: 'Recompute ratings and MVP selection' })
    @ApiResponse({ status: 200, description: 'Stats computed successfully' })
    async computeStats(
        @Request() req: any,
        @Param('id') matchId: string,
        @Body() dto: ComputeStatsDto,
    ): Promise<{ updated: number; mvpUpdated: boolean }> {
        return this.playerStatService.computeStatsAndMvp(req.tenant.id, matchId, dto);
    }

    // ===== EXPORT ENDPOINTS =====

    @Get('matches/:id/report.pdf')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Export match report as PDF' })
    @ApiResponse({ status: 200, description: 'PDF report generated successfully' })
    async exportMatchReport(
        @Request() req: any,
        @Param('id') matchId: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const report = await this.pdfExportService.generateMatchReport(req.tenant.id, matchId);

        // Construct the full file path
        const filePath = path.join(process.cwd(), 'data', req.tenant.id, 'exports', `match-report-${matchId}.pdf`);

        // Set headers for download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="match-report-${matchId}.pdf"`,
        });

        // Stream the file
        const file = fs.createReadStream(filePath);
        return new StreamableFile(file);
    }

    @Get('matches/:id/stats.csv')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Export match statistics as CSV' })
    @ApiResponse({ status: 200, description: 'CSV report generated successfully' })
    async exportMatchStats(
        @Request() req: any,
        @Param('id') matchId: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const report = await this.csvExportService.exportMatchStats(req.tenant.id, matchId);

        // Construct the full file path
        const filePath = path.join(process.cwd(), 'data', req.tenant.id, 'exports', `match-stats-${matchId}.csv`);

        // Set headers for download
        res.set({
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="match-stats-${matchId}.csv"`,
        });

        // Stream the file
        const file = fs.createReadStream(filePath);
        return new StreamableFile(file);
    }

    @Get('stats/export.csv')
    @Can('gamelog.view')
    @ApiOperation({ summary: 'Export aggregated statistics as CSV' })
    @ApiResponse({ status: 200, description: 'Aggregated CSV report generated successfully' })
    async exportAggregatedStats(
        @Request() req: any,
        @Query('teamId') teamId?: string,
        @Query('playerId') playerId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('tournament') tournament?: string,
    ) {
        const options: any = {};
        if (teamId) options.teamId = teamId;
        if (playerId) options.playerId = playerId;
        if (from) options.from = new Date(from);
        if (to) options.to = new Date(to);
        if (tournament) options.tournament = tournament;

        return this.csvExportService.exportAggregatedStats(req.tenant.id, options);
    }
}
