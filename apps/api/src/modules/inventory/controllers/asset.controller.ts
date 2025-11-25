import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { createReadStream } from 'fs';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../../rbac/decorators/can.decorator';
import { PermissionGuard } from '../../rbac/guards/permission.guard';
import { QueryAssetsDto, UpdateAssetDto } from '../dto/asset.dto';
import { AssetService } from '../services/asset.service';

@ApiTags('assets')
@ApiBearerAuth()
@Controller('org/:slug/assets')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('upload')
  @Can('assets.upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload asset file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Asset uploaded successfully' })
  async uploadAsset(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    return await this.assetService.uploadAsset(
      req.tenant!.id,
      file,
      req.orgUser!.id,
      req.orgUser?.email ?? null
    );
  }

  @Get()
  @Can('assets.upload')
  @ApiOperation({ summary: 'List assets with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Assets retrieved successfully' })
  async findAssets(@Req() req: Request, @Query() query: QueryAssetsDto) {
    return await this.assetService.findAssets(req.tenant!.id, query);
  }

  @Get(':id')
  @Can('assets.upload')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset retrieved successfully' })
  async findAssetById(@Req() req: Request, @Param('id') assetId: string) {
    return await this.assetService.findAssetById(req.tenant!.id, assetId);
  }

  @Put(':id')
  @Can('assets.manage')
  @ApiOperation({ summary: 'Update asset metadata' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset updated successfully' })
  async updateAsset(
    @Req() req: Request,
    @Param('id') assetId: string,
    @Body() updateAssetDto: UpdateAssetDto
  ) {
    return await this.assetService.updateAsset(
      req.tenant!.id,
      assetId,
      updateAssetDto,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Get(':id/download')
  @Can('assets.upload')
  @ApiOperation({ summary: 'Download asset file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset file stream' })
  async downloadAsset(
    @Req() req: Request,
    @Param('id') assetId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const downloadInfo = await this.assetService.downloadAsset(req.tenant!.id, assetId);

    res.set({
      'Content-Type': downloadInfo.mimetype,
      'Content-Disposition': `attachment; filename="${downloadInfo.filename}"`,
      'Content-Length': downloadInfo.size.toString(),
    });

    const file = createReadStream(downloadInfo.path);
    return new StreamableFile(file);
  }

  @Get(':id/versions')
  @Can('assets.upload')
  @ApiOperation({ summary: 'Get asset version history' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset versions retrieved successfully' })
  async getAssetVersions(@Req() req: Request, @Param('id') assetId: string) {
    return await this.assetService.getAssetVersions(req.tenant!.id, assetId);
  }

  @Get(':id/versions/:versionId/download')
  @Can('assets.upload')
  @ApiOperation({ summary: 'Download specific asset version' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset version file stream' })
  async downloadAssetVersion(
    @Req() req: Request,
    @Param('id') assetId: string,
    @Param('versionId') versionId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const downloadInfo = await this.assetService.downloadAssetVersion(
      req.tenant!.id,
      assetId,
      versionId
    );

    res.set({
      'Content-Type': downloadInfo.mimetype,
      'Content-Disposition': `attachment; filename="${downloadInfo.filename}"`,
      'Content-Length': downloadInfo.size.toString(),
    });

    const file = createReadStream(downloadInfo.path);
    return new StreamableFile(file);
  }

  @Delete(':id')
  @Can('assets.manage')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset deleted successfully' })
  async deleteAsset(@Req() req: Request, @Param('id') assetId: string) {
    return await this.assetService.deleteAsset(
      req.tenant!.id,
      assetId,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Put(':id/approve')
  @Can('assets.approve')
  @ApiOperation({ summary: 'Approve a pending asset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset approved successfully' })
  async approveAsset(@Req() req: Request, @Param('id') assetId: string) {
    return await this.assetService.approveAsset(
      req.tenant!.id,
      assetId,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }

  @Put(':id/reject')
  @Can('assets.approve')
  @ApiOperation({ summary: 'Reject a pending asset' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Asset rejected successfully' })
  async rejectAsset(@Req() req: Request, @Param('id') assetId: string) {
    return await this.assetService.rejectAsset(
      req.tenant!.id,
      assetId,
      req.orgUser?.id ?? null,
      req.orgUser?.email ?? null
    );
  }
}
