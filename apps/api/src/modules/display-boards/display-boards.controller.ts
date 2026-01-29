import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantId } from '../../common/tenant/decorators/tenant-id.decorator';
import { TenantGuard } from '../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../common/tenant/guards/unified-tenant-auth.guard';
import { Can } from '../rbac/decorators/can.decorator';
import { PermissionGuard } from '../rbac/guards/permission.guard';
import { DisplayBoardsService } from './display-boards.service';
import { CreateDisplayBoardDto } from './dto/create-display-board.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { UpdateDisplayBoardDto } from './dto/update-display-board.dto';

@ApiTags('Display Boards')
@ApiBearerAuth()
@Controller('org/:slug/display-boards')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard, PermissionGuard)
export class DisplayBoardsController {
    constructor(private readonly service: DisplayBoardsService) { }

    @Get()
    @ApiOperation({ summary: 'List all display boards for the organisation' })
    @Can('display-boards.view')
    async list(@TenantId() tenantId: string, @Req() req: any) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.list(actualTenantId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single display board with images' })
    @Can('display-boards.view')
    async getById(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.getById(actualTenantId, id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new display board' })
    @Can('display-boards.manage')
    async create(
        @TenantId() tenantId: string,
        @Body() dto: CreateDisplayBoardDto,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.create(
            actualTenantId,
            dto,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update display board metadata' })
    @Can('display-boards.manage')
    async update(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Body() dto: UpdateDisplayBoardDto,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.update(
            actualTenantId,
            id,
            dto,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a display board and all its images' })
    @Can('display-boards.manage')
    async delete(
        @TenantId() tenantId: string,
        @Param('id') id: string,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.delete(
            actualTenantId,
            id,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Post(':id/images')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload an image to the display board' })
    @UseInterceptors(FileInterceptor('file'))
    @Can('display-boards.manage')
    async uploadImage(
        @TenantId() tenantId: string,
        @Param('id') boardId: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        if (!file) {
            throw new BadRequestException('Upload an image file');
        }

        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.uploadImage(
            actualTenantId,
            boardId,
            file,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Delete(':boardId/images/:imageId')
    @ApiOperation({ summary: 'Delete an image from the display board' })
    @Can('display-boards.manage')
    async deleteImage(
        @TenantId() tenantId: string,
        @Param('boardId') boardId: string,
        @Param('imageId') imageId: string,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.deleteImage(
            actualTenantId,
            boardId,
            imageId,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Patch(':id/images/reorder')
    @ApiOperation({ summary: 'Reorder images in the display board' })
    @Can('display-boards.manage')
    async reorderImages(
        @TenantId() tenantId: string,
        @Param('id') boardId: string,
        @Body() dto: ReorderImagesDto,
        @Req() req: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        return this.service.reorderImages(
            actualTenantId,
            boardId,
            dto.imageIds,
            req.orgUser?.id,
            req.orgUser?.email ?? req.globalUser?.email ?? null
        );
    }

    @Get(':id/images/:imageId/file')
    @ApiOperation({ summary: 'Serve an image file (authenticated)' })
    @Can('display-boards.view')
    async getImageFile(
        @TenantId() tenantId: string,
        @Param('id') boardId: string,
        @Param('imageId') imageId: string,
        @Req() req: any,
        @Res() res: any
    ) {
        const actualTenantId = req.tenant?.id || tenantId;
        const board = await this.service.getById(actualTenantId, boardId);
        const image = board.images.find((img: any) => img.id === imageId);

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const buffer = await this.service.getImageFile(actualTenantId, boardId, imageId);

        res.setHeader('Content-Type', image.mimeType);
        res.setHeader('Content-Length', image.fileSize);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(buffer);
    }
}
