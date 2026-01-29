import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DisplayBoardsService } from './display-boards.service';

@ApiTags('Display Boards Public')
@Controller('public/display-boards')
export class DisplayBoardsPublicController {
    constructor(private readonly service: DisplayBoardsService) { }

    @Get(':publicCode/data')
    @ApiOperation({ summary: 'Get display board data for public viewer (no auth required)' })
    async getData(@Param('publicCode') publicCode: string) {
        const board = await this.service.getByPublicCode(publicCode);

        return {
            id: board.id,
            name: board.name,
            interval: board.interval,
            transition: board.transition || 'fade',
            images: board.images.map((img: any) => ({
                id: img.id,
                fileName: img.fileName,
                url: `/api/public/display-boards/${publicCode}/images/${img.id}`,
                order: img.order,
            })),
        };
    }

    @Get(':publicCode/images/:imageId')
    @ApiOperation({ summary: 'Serve an image file from the display board (no auth required)' })
    @Header('Cache-Control', 'public, max-age=3600')
    async getImage(
        @Param('publicCode') publicCode: string,
        @Param('imageId') imageId: string,
        @Res() res: Response
    ) {
        const board = await this.service.getByPublicCode(publicCode);
        const image = board.images.find((img: any) => img.id === imageId);

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const buffer = await this.service.getImageFile(board.tenantId, board.id, imageId);

        res.setHeader('Content-Type', image.mimeType);
        res.setHeader('Content-Length', image.fileSize);
        res.send(buffer);
    }
}
