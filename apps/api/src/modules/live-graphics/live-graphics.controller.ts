import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantId } from '../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { CreateLiveGraphicDto } from './dto/create-live-graphic.dto';
import { UpdateLiveGraphicDto } from './dto/update-live-graphic.dto';
import { UpdateLiveGraphicStateDto } from './dto/update-live-graphic-state.dto';
import { LiveGraphicsService } from './live-graphics.service';
import { UploadLiveGraphicDto } from './dto/upload-live-graphic.dto';

@ApiTags('Live Graphics')
@ApiBearerAuth()
@Controller('org/:slug/live-graphics')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class LiveGraphicsController {
  constructor(private readonly service: LiveGraphicsService) {}

  @Get()
  @ApiOperation({ summary: 'List live graphics for the organisation' })
  @Can('live-graphics.view')
  async listGraphics(@TenantId() tenantId: string, @Param('slug') slug: string, @Req() req: any) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.list(actualTenantId, slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single live graphic' })
  @Can('live-graphics.view')
  async getGraphic(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Req() req: any
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.getById(actualTenantId, slug, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a live graphic draft and return the client snippet to embed' })
  @Can('live-graphics.manage')
  async createGraphic(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Body() dto: CreateLiveGraphicDto,
    @Req() req: any
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.createDraft(
      actualTenantId,
      slug,
      dto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Post(':id/upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload and verify the HTML file containing the replayhub client script',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Can('live-graphics.manage')
  async uploadGraphic(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('Upload an HTML file');
    }

    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.uploadHtml(
      actualTenantId,
      slug,
      id,
      file,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update live graphic metadata' })
  @Can('live-graphics.manage')
  async updateGraphic(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: UpdateLiveGraphicDto,
    @Req() req: any
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.updateMetadata(
      actualTenantId,
      slug,
      id,
      dto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Patch(':id/state')
  @ApiOperation({ summary: 'Update live graphic scoreboard/state' })
  @Can('live-graphics.manage')
  async updateGraphicState(
    @TenantId() tenantId: string,
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() dto: UpdateLiveGraphicStateDto,
    @Req() req: any
  ) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.updateState(
      actualTenantId,
      slug,
      id,
      dto,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a live graphic' })
  @Can('live-graphics.manage')
  async deleteGraphic(@TenantId() tenantId: string, @Param('id') id: string, @Req() req: any) {
    const actualTenantId = req.tenant?.id || tenantId;
    return this.service.deleteGraphic(
      actualTenantId,
      id,
      req.orgUser?.id,
      req.orgUser?.email ?? req.globalUser?.email ?? null
    );
  }
}
