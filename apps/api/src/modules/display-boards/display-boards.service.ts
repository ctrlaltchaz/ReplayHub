import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../database/prisma.service';
import { CreateDisplayBoardDto } from './dto/create-display-board.dto';
import { UpdateDisplayBoardDto } from './dto/update-display-board.dto';

const fsp = fs.promises;

type DisplayBoard = {
    id: string;
    tenantId: string;
    name: string;
    description?: string | null;
    publicCode: string;
    interval: number;
    status: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type DisplayBoardImage = {
    id: string;
    tenantId: string;
    displayBoardId: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    fileSize: number;
    order: number;
    status: string;
    uploadedBy?: string | null;
    uploadedAt: Date;
};

type DisplayBoardWithImages = DisplayBoard & {
    images: DisplayBoardImage[];
    imageCount?: number;
    publicUrl?: string;
};

@Injectable()
export class DisplayBoardsService {
    private readonly uploadBase = process.env.ASSET_UPLOAD_DIR || './data';

    constructor(
        private prisma: PrismaService,
        private auditService: AuditService
    ) { }

    private repo(client: PrismaService | Prisma.TransactionClient = this.prisma) {
        return (client as any).displayBoard;
    }

    private imageRepo(client: PrismaService | Prisma.TransactionClient = this.prisma) {
        return (client as any).displayBoardImage;
    }

    private async resolveOrgUserId(
        client: Prisma.TransactionClient,
        tenantId: string,
        orgUserId?: string | null
    ) {
        if (!orgUserId) return null;
        const record = await client.orgUser.findFirst({
            where: { id: orgUserId, tenantId },
            select: { id: true },
        });
        return record?.id ?? null;
    }

    private async withTenantContext<T>(
        tenantId: string,
        callback: (client: Prisma.TransactionClient) => Promise<T>
    ) {
        return this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
            await (tx as any).$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
            return callback(tx);
        });
    }

    private buildPublicUrl(publicCode: string) {
        return `/display-boards/${publicCode}`;
    }

    private getBoardPath(tenantId: string, boardId: string): string {
        return path.join(this.uploadBase, 'display-boards', tenantId, boardId);
    }

    private async ensureBoardDirectory(tenantId: string, boardId: string): Promise<void> {
        const boardPath = this.getBoardPath(tenantId, boardId);
        await fsp.mkdir(boardPath, { recursive: true });
    }

    async list(tenantId: string) {
        return this.withTenantContext(tenantId, async client => {
            const boards = await this.repo(client).findMany({
                where: { tenantId },
                include: {
                    images: {
                        where: { status: 'active' },
                        orderBy: { order: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return boards.map((board: any) => ({
                ...board,
                imageCount: board.images?.length || 0,
                publicUrl: this.buildPublicUrl(board.publicCode),
            }));
        });
    }

    async getById(tenantId: string, id: string): Promise<DisplayBoardWithImages> {
        return this.withTenantContext(tenantId, async client => {
            const board = await this.repo(client).findFirst({
                where: { id, tenantId },
                include: {
                    images: {
                        where: { status: 'active' },
                        orderBy: { order: 'asc' },
                    },
                },
            });

            if (!board) {
                throw new NotFoundException('Display board not found');
            }

            return {
                ...board,
                imageCount: board.images?.length || 0,
                publicUrl: this.buildPublicUrl(board.publicCode),
            };
        });
    }

    async getByPublicCode(publicCode: string) {
        const board = await this.repo(this.prisma).findFirst({
            where: { publicCode, status: 'active' },
            include: {
                images: {
                    where: { status: 'active' },
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!board) {
            throw new NotFoundException('Display board not found');
        }

        return board;
    }

    async create(
        tenantId: string,
        dto: CreateDisplayBoardDto,
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        const publicCode = createId();

        return this.withTenantContext(tenantId, async client => {
            const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);

            const created = await this.repo(client).create({
                data: {
                    tenantId,
                    name: dto.name,
                    description: dto.description,
                    publicCode,
                    interval: dto.interval || 5000,
                    status: 'active',
                    createdBy: actorOrgUserId,
                },
            });

            // Create directory for images
            await this.ensureBoardDirectory(tenantId, created.id);

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.create',
                    entity: 'display_board',
                    entityId: created.id,
                    description: 'Created display board',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: {
                        name: dto.name,
                        publicCode,
                    },
                },
                client
            );

            return {
                ...created,
                imageCount: 0,
                publicUrl: this.buildPublicUrl(created.publicCode),
            };
        });
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateDisplayBoardDto,
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        return this.withTenantContext(tenantId, async client => {
            const existing = await this.repo(client).findFirst({
                where: { id, tenantId },
            });

            if (!existing) {
                throw new NotFoundException('Display board not found');
            }

            const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);

            const updated = await this.repo(client).update({
                where: { id },
                data: {
                    ...dto,
                    updatedBy: actorOrgUserId,
                },
                include: {
                    images: {
                        where: { status: 'active' },
                        orderBy: { order: 'asc' },
                    },
                },
            });

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.update',
                    entity: 'display_board',
                    entityId: id,
                    description: 'Updated display board',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: dto,
                },
                client
            );

            return {
                ...updated,
                imageCount: updated.images?.length || 0,
                publicUrl: this.buildPublicUrl(updated.publicCode),
            };
        });
    }

    async delete(
        tenantId: string,
        id: string,
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        return this.withTenantContext(tenantId, async client => {
            const existing = await this.repo(client).findFirst({
                where: { id, tenantId },
                include: {
                    images: true,
                },
            });

            if (!existing) {
                throw new NotFoundException('Display board not found');
            }

            // Delete all physical files
            const boardPath = this.getBoardPath(tenantId, id);
            try {
                await fsp.rm(boardPath, { recursive: true, force: true });
            } catch (error) {
                console.error(`Failed to delete board directory: ${boardPath}`, error);
            }

            // Delete from database (cascade will handle images)
            await this.repo(client).delete({
                where: { id },
            });

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.delete',
                    entity: 'display_board',
                    entityId: id,
                    description: 'Deleted display board',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: {
                        name: existing.name,
                        imageCount: existing.images?.length || 0,
                    },
                },
                client
            );

            return { success: true };
        });
    }

    async uploadImage(
        tenantId: string,
        boardId: string,
        file: Express.Multer.File,
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required');
        }

        const mime = (file.mimetype || '').toLowerCase();
        const isImage = mime.startsWith('image/') && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mime);

        if (!isImage) {
            throw new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are supported');
        }

        if (file.size > 10 * 1024 * 1024) {
            throw new BadRequestException('File is too large (10MB max)');
        }

        return this.withTenantContext(tenantId, async client => {
            const board = await this.repo(client).findFirst({
                where: { id: boardId, tenantId },
            });

            if (!board) {
                throw new NotFoundException('Display board not found');
            }

            await this.ensureBoardDirectory(tenantId, boardId);

            const actorOrgUserId = await this.resolveOrgUserId(client, tenantId, orgUserId);
            const imageId = createId();
            const fileName = `${imageId}-${file.originalname}`;
            const filePath = path.join(this.getBoardPath(tenantId, boardId), fileName);

            // Save file
            await fsp.writeFile(filePath, file.buffer);

            // Get next order
            const maxOrder = await this.imageRepo(client).findFirst({
                where: { displayBoardId: boardId, tenantId },
                orderBy: { order: 'desc' },
                select: { order: true },
            });

            const nextOrder = (maxOrder?.order ?? -1) + 1;

            // Create database record
            const image = await this.imageRepo(client).create({
                data: {
                    id: imageId,
                    tenantId,
                    displayBoardId: boardId,
                    fileName: file.originalname,
                    filePath: fileName, // Store relative path
                    mimeType: file.mimetype,
                    fileSize: file.size,
                    order: nextOrder,
                    status: 'active',
                    uploadedBy: actorOrgUserId,
                },
            });

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.image.upload',
                    entity: 'display_board_image',
                    entityId: image.id,
                    description: 'Uploaded image to display board',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: {
                        boardId,
                        fileName: file.originalname,
                        fileSize: file.size,
                    },
                },
                client
            );

            return image;
        });
    }

    async deleteImage(
        tenantId: string,
        boardId: string,
        imageId: string,
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        return this.withTenantContext(tenantId, async client => {
            const image = await this.imageRepo(client).findFirst({
                where: {
                    id: imageId,
                    displayBoardId: boardId,
                    tenantId,
                },
            });

            if (!image) {
                throw new NotFoundException('Image not found');
            }

            // Delete physical file
            const filePath = path.join(this.getBoardPath(tenantId, boardId), image.filePath);
            try {
                await fsp.unlink(filePath);
            } catch (error) {
                console.error(`Failed to delete image file: ${filePath}`, error);
            }

            // Delete from database
            await this.imageRepo(client).delete({
                where: { id: imageId },
            });

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.image.delete',
                    entity: 'display_board_image',
                    entityId: imageId,
                    description: 'Deleted image from display board',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: {
                        boardId,
                        fileName: image.fileName,
                    },
                },
                client
            );

            return { success: true };
        });
    }

    async reorderImages(
        tenantId: string,
        boardId: string,
        imageIds: string[],
        orgUserId?: string | null,
        actorEmail?: string | null
    ) {
        return this.withTenantContext(tenantId, async client => {
            const board = await this.repo(client).findFirst({
                where: { id: boardId, tenantId },
            });

            if (!board) {
                throw new NotFoundException('Display board not found');
            }

            // Update order for each image
            const updates = imageIds.map((imageId, index) =>
                this.imageRepo(client).updateMany({
                    where: {
                        id: imageId,
                        displayBoardId: boardId,
                        tenantId,
                    },
                    data: {
                        order: index,
                    },
                })
            );

            await Promise.all(updates);

            await this.auditService.log(
                {
                    tenantId,
                    action: 'display-boards.image.reorder',
                    entity: 'display_board',
                    entityId: boardId,
                    description: 'Reordered display board images',
                    orgUserId: orgUserId ?? undefined,
                    actorEmail,
                    metadata: {
                        imageCount: imageIds.length,
                    },
                },
                client
            );

            return { success: true };
        });
    }

    async getImageFile(tenantId: string, boardId: string, imageId: string): Promise<Buffer> {
        const image = await this.imageRepo(this.prisma).findFirst({
            where: {
                id: imageId,
                displayBoardId: boardId,
                tenantId,
                status: 'active',
            },
        });

        if (!image) {
            throw new NotFoundException('Image not found');
        }

        const filePath = path.join(this.getBoardPath(tenantId, boardId), image.filePath);

        try {
            return await fsp.readFile(filePath);
        } catch (error) {
            console.error(`Failed to read image file: ${filePath}`, error);
            throw new NotFoundException('Image file not found');
        }
    }
}
