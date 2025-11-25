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
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { TeamService } from '../services/team.service';

interface CreateTeamDto {
  name: string;
  game: string;
  season?: string;
  coachId?: string;
}

interface UpdateTeamDto {
  name?: string;
  game?: string;
  season?: string;
  coachId?: string;
  status?: 'active' | 'archived';
}

interface TeamQueryDto {
  game?: string;
  season?: string;
  status?: 'active' | 'archived';
  q?: string;
}

interface AddTeamMemberDto {
  playerId: string;
  isStarter?: boolean;
  position?: string;
}

interface UpdateTeamMemberDto {
  isStarter?: boolean;
  position?: string;
}

@Controller('org/:slug/teams')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Can('team.create')
  @UseGuards(PermissionGuard)
  async create(@Req() req: Request, @Body() createTeamDto: CreateTeamDto) {
    return this.teamService.create(
      req.tenant!.id,
      createTeamDto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Get()
  @Can('roster.view')
  async findAll(@Req() req: Request, @Query() query: TeamQueryDto) {
    return this.teamService.findMany(req.tenant!.id, query);
  }

  @Get(':id')
  @Can('roster.view')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.teamService.findOne(req.tenant!.id, id);
  }

  @Put(':id')
  @Can('team.update')
  async update(@Req() req: Request, @Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.update(
      req.tenant!.id,
      id,
      updateTeamDto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Delete(':id')
  @Can('team.delete')
  async delete(@Req() req: Request, @Param('id') id: string) {
    return this.teamService.delete(
      req.tenant!.id,
      id,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Post(':id/archive')
  @Can('team.archive')
  async archive(@Req() req: Request, @Param('id') id: string) {
    return this.teamService.archive(
      req.tenant!.id,
      id,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Post(':id/members')
  @Can('roster.manage')
  async addMember(
    @Req() req: Request,
    @Param('id') teamId: string,
    @Body() addMemberDto: AddTeamMemberDto
  ) {
    return this.teamService.addMember(
      req.tenant!.id,
      teamId,
      addMemberDto.playerId,
      addMemberDto.isStarter,
      addMemberDto.position,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Delete(':id/members/:playerId')
  @Can('roster.manage')
  async removeMember(
    @Req() req: Request,
    @Param('id') teamId: string,
    @Param('playerId') playerId: string
  ) {
    return this.teamService.removeMember(
      req.tenant!.id,
      teamId,
      playerId,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Put(':id/members/:playerId')
  @Can('roster.manage')
  async updateMember(
    @Req() req: Request,
    @Param('id') teamId: string,
    @Param('playerId') playerId: string,
    @Body() updateMemberDto: UpdateTeamMemberDto
  ) {
    return this.teamService.updateMember(
      req.tenant!.id,
      teamId,
      playerId,
      updateMemberDto.isStarter,
      updateMemberDto.position,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }
}
