import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantGuard } from '../../../common/tenant/guards/tenant.guard';
import { UnifiedTenantAuthGuard } from '../../../common/tenant/guards/unified-tenant-auth.guard';
import { DocsUploadService } from '../services/docs-upload.service';

@Controller('docs/upload')
@UseGuards(TenantGuard, UnifiedTenantAuthGuard)
export class DocsUploadController {
    constructor(private readonly docsUploadService: DocsUploadService) { }

    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            throw new BadRequestException('File too large. Maximum size is 10MB');
        }

        const imageUrl = await this.docsUploadService.uploadImage(file);
        return { url: imageUrl };
    }
}
