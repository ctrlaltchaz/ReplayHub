import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import { PrismaService } from '../../database/prisma.service';
import { QuickLink } from './dto/quick-links.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
    constructor(private prisma: PrismaService) { }

    private readonly uploadDir = process.env.ASSET_UPLOAD_DIR || './data';
    private readonly maxFileSize = 5 * 1024 * 1024; // 5MB for logos
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

    async getOrganization(tenantId: string) {
        const organization = await this.prisma.organisation.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                slug: true,
                name: true,
                branding: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return organization;
    }

    async updateOrganization(tenantId: string, updateDto: UpdateOrganizationDto) {
        // Check if organization exists
        const existing = await this.prisma.organisation.findUnique({
            where: { id: tenantId },
        });

        if (!existing) {
            throw new NotFoundException('Organization not found');
        }

        // Update organization
        const organization = await this.prisma.organisation.update({
            where: { id: tenantId },
            data: {
                ...(updateDto.name && { name: updateDto.name }),
                ...(updateDto.branding && { branding: updateDto.branding }),
                updatedAt: new Date(),
            },
            select: {
                id: true,
                slug: true,
                name: true,
                branding: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return organization;
    }

    private validateLogoFile(file: Express.Multer.File): void {
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

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    async uploadLogo(tenantId: string, file: Express.Multer.File): Promise<string> {
        // Validate file
        this.validateLogoFile(file);

        // Generate upload path for organization logos
        const uploadPath = path.join(this.uploadDir, tenantId, 'logos');
        await this.ensureDirectoryExists(uploadPath);

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const filename = `logo_${timestamp}${ext}`;
        const fullPath = path.join(uploadPath, filename);

        try {
            // Save file to disk
            await fs.writeFile(fullPath, file.buffer);

            // Generate relative URL for the logo
            const relativePath = path.relative(this.uploadDir, fullPath).replace(/\\/g, '/');
            const logoUrl = `/uploads/${relativePath}`;

            // Update organization with new logo URL
            await this.prisma.organisation.update({
                where: { id: tenantId },
                data: {
                    branding: {
                        ...(await this.getOrganization(tenantId).then(org => org.branding as any || {})),
                        logoUrl,
                    },
                    updatedAt: new Date(),
                },
            });

            return logoUrl;
        } catch (error) {
            console.error('Failed to upload logo:', error);
            throw new BadRequestException('Failed to upload logo');
        }
    }

    async getQuickLinks(tenantId: string): Promise<QuickLink[]> {
        const organization = await this.prisma.organisation.findUnique({
            where: { id: tenantId },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // Parse and return quick links, defaulting to empty array
        const quickLinksData = (organization as any).quickLinksJson;

        if (!quickLinksData) {
            return [];
        }

        // Type guard: Ensure it's an array and cast to QuickLink[]
        if (Array.isArray(quickLinksData)) {
            return quickLinksData as QuickLink[];
        }

        return [];
    }

    async updateQuickLinks(tenantId: string, quickLinks: QuickLink[]): Promise<QuickLink[]> {
        // Check if organization exists
        const existing = await this.prisma.organisation.findUnique({
            where: { id: tenantId },
        });

        if (!existing) {
            throw new NotFoundException('Organization not found');
        }

        // Update organization with new quick links
        await this.prisma.organisation.update({
            where: { id: tenantId },
            data: {
                ...(quickLinks !== undefined && { quickLinksJson: quickLinks as any }),
                updatedAt: new Date(),
            } as any,
        });

        return quickLinks;
    }
}
