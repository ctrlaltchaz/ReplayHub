import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { CreateLineupDto, SetLineupSlotsDto, UpdateLineupDto } from '../dto';
import { LineupService } from '../services/lineup.service';

@Controller('org/:slug')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class LineupController {
  constructor(private readonly lineupService: LineupService) {}

  @Post('events/:eventId/lineup')
  @Can('lineup.create')
  async create(
    @Req() req: Request,
    @Param('eventId') eventId: string,
    @Body() createLineupDto: CreateLineupDto
  ) {
    return this.lineupService.create(
      req.tenant!.id,
      eventId,
      createLineupDto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Get('lineups')
  @Can('roster.view')
  async findAll(@Req() req: Request) {
    return this.lineupService.findAll(req.tenant!.id);
  }

  @Get('lineups/:id')
  @Can('roster.view')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.lineupService.findOne(req.tenant!.id, id);
  }

  @Get('events/:eventId/lineup')
  @Can('roster.view')
  async findByEvent(@Req() req: Request, @Param('eventId') eventId: string) {
    return this.lineupService.findByEvent(req.tenant!.id, eventId);
  }

  @Put('lineups/:id')
  @Can('lineup.update')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateLineupDto: UpdateLineupDto
  ) {
    return this.lineupService.update(
      req.tenant!.id,
      id,
      updateLineupDto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Post('lineups/:id/slots')
  @Can('lineup.update')
  async setSlots(
    @Req() req: Request,
    @Param('id') lineupId: string,
    @Body() slotsDto: SetLineupSlotsDto
  ) {
    return this.lineupService.setSlots(
      req.tenant!.id,
      lineupId,
      slotsDto.slots,
      slotsDto.autoAttachMissing,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Delete('lineups/:id/slots/:slotId')
  @Can('lineup.update')
  async removeSlot(
    @Req() req: Request,
    @Param('id') lineupId: string,
    @Param('slotId') slotId: string
  ) {
    return this.lineupService.removeSlot(
      req.tenant!.id,
      lineupId,
      slotId,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Get('teams/:teamId/available-players')
  @Can('roster.view')
  async getAvailablePlayersForLineup(
    @Req() req: Request,
    @Param('teamId') teamId: string,
    @Param('date') date?: string
  ) {
    return this.lineupService.getAvailablePlayersForLineup(req.tenant!.id, teamId, date);
  }

  @Post('lineups/:id/publish')
  @Can('lineup.publish')
  async publish(@Req() req: Request, @Param('id') lineupId: string) {
    return this.lineupService.publish(
      req.tenant!.id,
      lineupId,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Delete('lineups/:id')
  @Can('lineup.delete')
  async delete(@Req() req: Request, @Param('id') lineupId: string) {
    return this.lineupService.delete(
      req.tenant!.id,
      lineupId,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }
}
