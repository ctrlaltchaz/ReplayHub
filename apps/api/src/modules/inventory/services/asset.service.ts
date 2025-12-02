import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import { AssetUploadResponseDto, QueryAssetsDto, UpdateAssetDto } from '../dto/asset.dto';
import {
  CreateFolderDto,
  FolderResponseDto,
  FolderWithContentsDto,
  QueryFoldersDto,
  UpdateFolderDto,
} from '../dto/folder.dto';

@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  private readonly uploadDir = process.env.ASSET_UPLOAD_DIR || './data';
  private readonly maxFileSize = parseInt(process.env.MAX_ASSET_SIZE || '100') * 1024 * 1024; // Default: 100MB
  private readonly allowedMimeTypes = (
    process.env.ALLOWED_MIME_TYPES ||
    'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf,text/plain'
  ).split(',');

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
      throw new BadRequestException(
        `File too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }

    const detectedMime = mime.lookup(file.originalname) || file.mimetype;
    if (!this.allowedMimeTypes.includes(detectedMime)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }
  }

  async uploadAsset(
    tenantId: string,
    file: Express.Multer.File,
    createdBy: string,
    actorEmail?: string | null,
    folderId?: string | null
  ): Promise<AssetUploadResponseDto> {
    return await this.prisma.$transaction(async tx => {
      // Set RLS context
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

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
      const existingAsset = await tx.asset.findFirst({
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
        } else {
          // Create new asset
          asset = await tx.asset.create({
            data: {
              tenantId,
              path: relativePath,
              name: baseName,
              mime: file.mimetype,
              size: file.size,
              createdBy,
              folderId: folderId || null,
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
        }

        const response = {
          id: asset.id,
          path: asset.path,
          name: asset.name,
          mime: asset.mime,
          size: asset.size,
          version: asset.version,
          status: asset.status,
          createdAt: asset.createdAt,
        };

        await this.auditService.log({
          tenantId,
          action: 'asset.upload',
          entity: 'asset',
          entityType: 'ORG_USER',
          entityId: asset.id,
          orgUserId: createdBy,
          description: 'Uploaded asset',
          metadata: {
            name: asset.name,
            mime: asset.mime,
            size: asset.size,
            version: asset.version,
            actorEmail,
          },
        });

        return response;
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
    });
  }

  async findAssets(tenantId: string, query: QueryAssetsDto) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const where: any = { tenantId };

      // Apply filters
      if (query.status) {
        where.status = query.status;
      }

      if (query.tag) {
        where.tags = { contains: query.tag, mode: 'insensitive' };
      }

      if (query.folderId !== undefined) {
        if (query.folderId === 'root' || query.folderId === 'null') {
          where.folderId = null;
        } else {
          where.folderId = query.folderId;
        }
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

      const assets = await tx.asset.findMany(findManyArgs);

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
    });
  }

  async findAssetById(tenantId: string, assetId: string) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
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
    });
  }

  async updateAsset(
    tenantId: string,
    assetId: string,
    dto: UpdateAssetDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      // Validate folder exists if folderId is being set to a non-null value
      if (dto.folderId !== undefined && dto.folderId !== null) {
        const folder = await tx.assetFolder.findFirst({
          where: { tenantId, id: dto.folderId },
        });
        if (!folder) {
          throw new NotFoundException(`Folder with ID ${dto.folderId} not found`);
        }
      }

      // Build update data object, including null values explicitly
      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.folderId !== undefined) updateData.folderId = dto.folderId;

      const updated = await tx.asset.update({
        where: { id: assetId },
        data: updateData,
      });

      await this.auditService.log({
        tenantId,
        action: 'asset.update',
        entity: 'asset',
        entityType: 'ORG_USER',
        entityId: assetId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Updated asset metadata',
        metadata: {
          name: updated.name,
          status: updated.status,
          actorEmail,
        },
      });

      return updated;
    });
  }

  async downloadAsset(tenantId: string, assetId: string) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (asset.status !== 'active') {
        throw new BadRequestException(
          `Asset is not available for download (status: ${asset.status})`
        );
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
    });
  }

  async getAssetVersions(tenantId: string, assetId: string) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      return await tx.assetVersion.findMany({
        where: { tenantId, assetId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async downloadAssetVersion(tenantId: string, assetId: string, versionId: string) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const version = await tx.assetVersion.findFirst({
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
    });
  }

  async deleteAsset(
    tenantId: string,
    assetId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      // Get all versions before deletion
      const versions = await tx.assetVersion.findMany({
        where: { assetId },
      });

      // Delete from database first (cascade will delete versions)
      await tx.asset.delete({
        where: { id: assetId },
      });

      // Delete files from disk after successful database deletion
      // (outside transaction to avoid blocking)
      setImmediate(async () => {
        // Delete the main file from disk
        const fullPath = path.join(this.uploadDir, asset.path);
        try {
          await fs.unlink(fullPath);
        } catch (error) {
          console.error(`Failed to delete file from disk: ${fullPath}`, error);
        }

        // Delete all version files from disk
        for (const version of versions) {
          const versionPath = path.join(this.uploadDir, version.path);
          try {
            await fs.unlink(versionPath);
          } catch (error) {
            console.error(`Failed to delete version file from disk: ${versionPath}`, error);
          }
        }
      });

      await this.auditService.log({
        tenantId,
        action: 'asset.delete',
        entity: 'asset',
        entityType: 'ORG_USER',
        entityId: assetId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Deleted asset',
        metadata: {
          name: asset.name,
          actorEmail,
        },
      });

      return { message: 'Asset deleted successfully' };
    });
  }

  async approveAsset(
    tenantId: string,
    assetId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (asset.status !== 'pending') {
        throw new BadRequestException(
          `Asset is not pending approval (current status: ${asset.status})`
        );
      }

      const updated = await tx.asset.update({
        where: { id: assetId },
        data: { status: 'active' },
      });

      await this.auditService.log({
        tenantId,
        action: 'asset.approve',
        entity: 'asset',
        entityType: 'ORG_USER',
        entityId: assetId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Approved asset',
        metadata: {
          name: updated.name,
          actorEmail,
        },
      });

      return updated;
    });
  }

  async rejectAsset(
    tenantId: string,
    assetId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const asset = await tx.asset.findFirst({
        where: { tenantId, id: assetId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (asset.status !== 'pending') {
        throw new BadRequestException(
          `Asset is not pending approval (current status: ${asset.status})`
        );
      }

      const updated = await tx.asset.update({
        where: { id: assetId },
        data: { status: 'archived' },
      });

      await this.auditService.log({
        tenantId,
        action: 'asset.reject',
        entity: 'asset',
        entityType: 'ORG_USER',
        entityId: assetId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Rejected asset',
        metadata: {
          name: updated.name,
          actorEmail,
        },
      });

      return updated;
    });
  }

  // ========== FOLDER MANAGEMENT METHODS ==========

  async createFolder(
    tenantId: string,
    dto: CreateFolderDto,
    createdBy: string,
    actorEmail?: string | null
  ): Promise<FolderResponseDto> {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      // Validate parent folder exists if provided
      if (dto.parentId) {
        const parentFolder = await tx.assetFolder.findFirst({
          where: { tenantId, id: dto.parentId },
        });

        if (!parentFolder) {
          throw new NotFoundException(`Parent folder with ID ${dto.parentId} not found`);
        }
      }

      // Check for duplicate folder name in the same parent
      const existingFolder = await tx.assetFolder.findFirst({
        where: {
          tenantId,
          name: dto.name,
          parentId: dto.parentId || null,
        },
      });

      if (existingFolder) {
        throw new BadRequestException(
          `A folder with the name "${dto.name}" already exists in this location`
        );
      }

      const folder = await tx.assetFolder.create({
        data: {
          tenantId,
          name: dto.name,
          parentId: dto.parentId || null,
          createdBy,
        },
        include: {
          _count: {
            select: {
              children: true,
              assets: true,
            },
          },
        },
      });

      await this.auditService.log({
        tenantId,
        action: 'folder.create',
        entity: 'asset_folder',
        entityType: 'ORG_USER',
        entityId: folder.id,
        orgUserId: createdBy,
        description: 'Created asset folder',
        metadata: {
          name: folder.name,
          parentId: folder.parentId,
          actorEmail,
        },
      });

      return folder;
    });
  }

  async findFolders(tenantId: string, query: QueryFoldersDto) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const where: any = { tenantId };

      // Filter by parent folder
      if (query.parentId !== undefined) {
        if (query.parentId === 'root') {
          where.parentId = null;
        } else {
          where.parentId = query.parentId;
        }
      }

      // Search by name
      if (query.q) {
        where.name = { contains: query.q, mode: 'insensitive' };
      }

      // Cursor-based pagination
      const orderBy = { name: 'asc' as const };
      const take = Math.min(query.limit || 50, 100);

      const findManyArgs: any = {
        where,
        orderBy,
        take: take + 1, // Take one extra to check if there's a next page
        include: {
          _count: {
            select: {
              children: true,
              assets: true,
            },
          },
        },
      };

      if (query.cursor) {
        findManyArgs.cursor = { id: query.cursor };
        findManyArgs.skip = 1; // Skip the cursor item
      }

      const folders = await tx.assetFolder.findMany(findManyArgs);

      const hasNextPage = folders.length > take;
      if (hasNextPage) {
        folders.pop(); // Remove the extra item
      }

      // Manually count assets for each folder to respect RLS
      const foldersWithCounts = await Promise.all(
        folders.map(async (folder: any) => {
          const assetCount = await tx.asset.count({
            where: {
              tenantId,
              folderId: folder.id,
            },
          });

          return {
            ...folder,
            _count: {
              children: folder._count?.children || 0,
              assets: assetCount,
            },
          };
        })
      );

      const nextCursor = hasNextPage ? foldersWithCounts[foldersWithCounts.length - 1]?.id : null;

      return {
        data: foldersWithCounts,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      };
    });
  }

  async findFolderById(tenantId: string, folderId: string): Promise<FolderWithContentsDto> {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const folder = await tx.assetFolder.findFirst({
        where: { tenantId, id: folderId },
        include: {
          children: {
            include: {
              _count: {
                select: {
                  children: true,
                  assets: true,
                },
              },
            },
          },
          assets: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }

      return folder as any;
    });
  }

  async updateFolder(
    tenantId: string,
    folderId: string,
    dto: UpdateFolderDto,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const folder = await tx.assetFolder.findFirst({
        where: { tenantId, id: folderId },
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }

      // Validate parent folder if changing
      if (dto.parentId !== undefined) {
        if (dto.parentId === folderId) {
          throw new BadRequestException('A folder cannot be its own parent');
        }

        if (dto.parentId) {
          // Check if parent exists
          const parentFolder = await tx.assetFolder.findFirst({
            where: { tenantId, id: dto.parentId },
          });

          if (!parentFolder) {
            throw new NotFoundException(`Parent folder with ID ${dto.parentId} not found`);
          }

          // Prevent circular references (check if new parent is a descendant)
          const isDescendant = await this.isFolderDescendant(
            tx,
            tenantId,
            dto.parentId,
            folderId
          );

          if (isDescendant) {
            throw new BadRequestException('Cannot move a folder into one of its descendants');
          }
        }
      }

      // Check for duplicate name if renaming
      if (dto.name && dto.name !== folder.name) {
        const existingFolder = await tx.assetFolder.findFirst({
          where: {
            tenantId,
            name: dto.name,
            parentId: dto.parentId !== undefined ? (dto.parentId || null) : folder.parentId,
            id: { not: folderId },
          },
        });

        if (existingFolder) {
          throw new BadRequestException(
            `A folder with the name "${dto.name}" already exists in this location`
          );
        }
      }

      const updated = await tx.assetFolder.update({
        where: { id: folderId },
        data: {
          name: dto.name,
          parentId: dto.parentId !== undefined ? (dto.parentId || null) : undefined,
        },
        include: {
          _count: {
            select: {
              children: true,
              assets: true,
            },
          },
        },
      });

      await this.auditService.log({
        tenantId,
        action: 'folder.update',
        entity: 'asset_folder',
        entityType: 'ORG_USER',
        entityId: folderId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Updated asset folder',
        metadata: {
          name: updated.name,
          parentId: updated.parentId,
          actorEmail,
        },
      });

      return updated;
    });
  }

  async deleteFolder(
    tenantId: string,
    folderId: string,
    actorOrgUserId?: string | null,
    actorEmail?: string | null
  ) {
    return await this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

      const folder = await tx.assetFolder.findFirst({
        where: { tenantId, id: folderId },
        include: {
          _count: {
            select: {
              children: true,
              assets: true,
            },
          },
        },
      });

      if (!folder) {
        throw new NotFoundException(`Folder with ID ${folderId} not found`);
      }

      // Check if folder has contents
      if (folder._count.children > 0 || folder._count.assets > 0) {
        throw new BadRequestException(
          'Cannot delete a folder that contains subfolders or assets. Please move or delete its contents first.'
        );
      }

      await tx.assetFolder.delete({
        where: { id: folderId },
      });

      await this.auditService.log({
        tenantId,
        action: 'folder.delete',
        entity: 'asset_folder',
        entityType: 'ORG_USER',
        entityId: folderId,
        orgUserId: actorOrgUserId ?? null,
        description: 'Deleted asset folder',
        metadata: {
          name: folder.name,
          actorEmail,
        },
      });

      return { success: true, message: 'Folder deleted successfully' };
    });
  }

  // Helper method to check if a folder is a descendant of another
  private async isFolderDescendant(
    tx: any,
    tenantId: string,
    potentialDescendantId: string,
    ancestorId: string
  ): Promise<boolean> {
    let currentId = potentialDescendantId;

    while (currentId) {
      const folder = await tx.assetFolder.findFirst({
        where: { tenantId, id: currentId },
        select: { parentId: true },
      });

      if (!folder || !folder.parentId) {
        return false;
      }

      if (folder.parentId === ancestorId) {
        return true;
      }

      currentId = folder.parentId;
    }

    return false;
  }
}
