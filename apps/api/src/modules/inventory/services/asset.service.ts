import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { PrismaService } from '../../../database/prisma.service';
import { AssetUploadResponseDto, QueryAssetsDto, UpdateAssetDto } from '../dto/asset.dto';

@Injectable()
export class AssetService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly uploadDir = process.env.ASSET_UPLOAD_DIR || './data';
    private readonly maxFileSize = parseInt(process.env.MAX_ASSET_SIZE || '100') * 1024 * 1024; // Default: 100MB
    private readonly allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES ||
        'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf,text/plain'
    ).split(',');

    // Set tenant context for RLS
    private async setTenantContext(tenantId: string) {
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    }

    // Generate tenant-specific upload path
    private getTenantUploadPath(tenantId: string): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return path.join(this.uploadDir, tenantId, 'assets', year.toString(), month);
    }

    // Ensure directory exists
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    // Validate file upload
    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`);
        }

        const detectedMime = mime.lookup(file.originalname) || file.mimetype;
        if (!this.allowedMimeTypes.includes(detectedMime)) {
            throw new BadRequestException(`File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }
    }

    async uploadAsset(
        tenantId: string,
        file: Express.Multer.File,
        createdBy: string
    ): Promise<AssetUploadResponseDto> {
        await this.setTenantContext(tenantId);

        // Validate file
        this.validateFile(file);

        // Generate upload path
        const uploadPath = this.getTenantUploadPath(tenantId);
        await this.ensureDirectoryExists(uploadPath);

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = `${timestamp}_${random}${ext}`;
        const fullPath = path.join(uploadPath, filename);

        // Check if asset already exists by name (for versioning)
        const baseName = path.basename(file.originalname, ext);
        const existingAsset = await this.prisma.asset.findFirst({
            where: {
                tenantId,
                name: baseName,
            },
            orderBy: { version: 'desc' },
        });

        try {
            // Save file to disk
            await fs.writeFile(fullPath, file.buffer);

            let asset;
            const relativePath = path.relative(this.uploadDir, fullPath).replace(/\\/g, '/');

            if (existingAsset) {
                // Create new version
                const newVersion = existingAsset.version + 1;

                await this.prisma.$transaction(async (tx) => {
                    // Update main asset record
                    asset = await tx.asset.update({
                        where: { id: existingAsset.id },
                        data: {
                            path: relativePath,
                            mime: file.mimetype,
                            size: file.size,
                            version: newVersion,
                            updatedAt: new Date(),
                        },
                    });

                    // Create version record
                    await tx.assetVersion.create({
                        data: {
                            tenantId,
                            assetId: asset.id,
                            path: relativePath,
                            size: file.size,
                            createdBy,
                        },
                    });
                });
            } else {
                // Create new asset
                await this.prisma.$transaction(async (tx) => {
                    asset = await tx.asset.create({
                        data: {
                            tenantId,
                            path: relativePath,
                            name: baseName,
                            mime: file.mimetype,
                            size: file.size,
                            createdBy,
                        },
                    });

                    // Create initial version record
                    await tx.assetVersion.create({
                        data: {
                            tenantId,
                            assetId: asset.id,
                            path: relativePath,
                            size: file.size,
                            createdBy,
                        },
                    });
                });
            }

            return {
                id: asset.id,
                path: asset.path,
                name: asset.name,
                mime: asset.mime,
                size: asset.size,
                version: asset.version,
                status: asset.status,
                createdAt: asset.createdAt,
            };
        } catch (error) {
            // Clean up file if database operation failed
            try {
                await fs.unlink(fullPath);
            } catch {
                // Ignore cleanup errors
            }

            if (error.code === 'ENOSPC') {
                throw new InternalServerErrorException('Insufficient storage space');
            }

            throw new InternalServerErrorException('Failed to upload asset');
        }
    }

    async findAssets(tenantId: string, query: QueryAssetsDto) {
        await this.setTenantContext(tenantId);

        const where: any = { tenantId };

        // Apply filters
        if (query.status) {
            where.status = query.status;
        }

        if (query.tag) {
            where.tags = { contains: query.tag, mode: 'insensitive' };
        }

        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { tags: { contains: query.q, mode: 'insensitive' } },
            ];
        }

        // Cursor-based pagination
        const orderBy = { createdAt: 'desc' as const };
        const take = Math.min(query.limit || 50, 100);

        const findManyArgs: any = {
            where,
            orderBy,
            take: take + 1, // Take one extra to check if there's a next page
            include: {
                _count: {
                    select: { versions: true },
                },
            },
        };

        if (query.cursor) {
            findManyArgs.cursor = { id: query.cursor };
            findManyArgs.skip = 1; // Skip the cursor item
        }

        const assets = await this.prisma.asset.findMany(findManyArgs);

        const hasNextPage = assets.length > take;
        if (hasNextPage) {
            assets.pop(); // Remove the extra item
        }

        const nextCursor = hasNextPage ? assets[assets.length - 1]?.id : null;

        return {
            data: assets,
            pagination: {
                hasNextPage,
                nextCursor,
            },
        };
    }

    async findAssetById(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
            include: {
                versions: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        return asset;
    }

    async updateAsset(tenantId: string, assetId: string, dto: UpdateAssetDto) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        return await this.prisma.asset.update({
            where: { id: assetId },
            data: dto,
        });
    }

    async downloadAsset(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        if (asset.status !== 'active') {
            throw new BadRequestException(`Asset is not available for download (status: ${asset.status})`);
        }

        const fullPath = path.join(this.uploadDir, asset.path);

        try {
            await fs.access(fullPath);

            return {
                path: fullPath,
                filename: `${asset.name}.${mime.extension(asset.mime) || 'bin'}`,
                mimetype: asset.mime,
                size: asset.size,
            };
        } catch {
            throw new NotFoundException('Asset file not found on disk');
        }
    }

    async getAssetVersions(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        return await this.prisma.assetVersion.findMany({
            where: { tenantId, assetId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async downloadAssetVersion(tenantId: string, assetId: string, versionId: string) {
        await this.setTenantContext(tenantId);

        const version = await this.prisma.assetVersion.findFirst({
            where: {
                tenantId,
                id: versionId,
                assetId,
            },
            include: {
                asset: true,
            },
        });

        if (!version) {
            throw new NotFoundException(`Asset version with ID ${versionId} not found`);
        }

        const fullPath = path.join(this.uploadDir, version.path);

        try {
            await fs.access(fullPath);

            return {
                path: fullPath,
                filename: `${version.asset.name}_v${version.asset.version}.${mime.extension(version.asset.mime) || 'bin'}`,
                mimetype: version.asset.mime,
                size: version.size,
            };
        } catch {
            throw new NotFoundException('Asset version file not found on disk');
        }
    }

    async deleteAsset(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        // Delete the file from disk
        const fullPath = path.join(this.uploadDir, asset.path);
        try {
            await fs.unlink(fullPath);
        } catch (error) {
            // Log error but continue with database deletion
            console.error(`Failed to delete file from disk: ${fullPath}`, error);
        }

        // Delete all versions from disk and database
        const versions = await this.prisma.assetVersion.findMany({
            where: { assetId },
        });

        for (const version of versions) {
            const versionPath = path.join(this.uploadDir, version.path);
            try {
                await fs.unlink(versionPath);
            } catch (error) {
                console.error(`Failed to delete version file from disk: ${versionPath}`, error);
            }
        }

        // Delete from database (cascade will delete versions)
        await this.prisma.asset.delete({
            where: { id: assetId },
        });

        return { message: 'Asset deleted successfully' };
    }

    async approveAsset(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        if (asset.status !== 'pending') {
            throw new BadRequestException(`Asset is not pending approval (current status: ${asset.status})`);
        }

        return await this.prisma.asset.update({
            where: { id: assetId },
            data: { status: 'active' },
        });
    }

    async rejectAsset(tenantId: string, assetId: string) {
        await this.setTenantContext(tenantId);

        const asset = await this.prisma.asset.findFirst({
            where: { tenantId, id: assetId },
        });

        if (!asset) {
            throw new NotFoundException(`Asset with ID ${assetId} not found`);
        }

        if (asset.status !== 'pending') {
            throw new BadRequestException(`Asset is not pending approval (current status: ${asset.status})`);
        }

        return await this.prisma.asset.update({
            where: { id: assetId },
            data: { status: 'archived' },
        });
    }
}