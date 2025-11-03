import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateRunsheetTemplateDto, UpdateRunsheetTemplateDto } from '../dto';

@Injectable()
export class RunsheetTemplateFullService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateRunsheetTemplateDto, createdBy: string) {
        // First, get the runsheet with all its items
        const runsheet = await this.prisma.runsheet.findFirst({
            where: { id: dto.runsheetId, tenantId },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });

        if (!runsheet) {
            throw new NotFoundException('Runsheet not found');
        }

        // Create the template with all items
        const createData = {
            tenantId,
            name: dto.name,
            description: dto.description,
            createdBy,
            items: {
                create: runsheet.items.map(item => ({
                    idx: item.idx,
                    title: item.title,
                    type: item.type,
                    ownerId: item.ownerId,
                    durationMs: item.durationMs,
                    location: item.location,
                    equipment: item.equipment,
                    priority: item.priority,
                    notes: item.notes,
                }))
            }
        };

        console.log('CREATE DATA:', JSON.stringify(createData, null, 2));

        return this.prisma.runsheetTemplate.create({
            data: createData,
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.runsheetTemplate.findMany({
            where: { tenantId },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findOne(tenantId: string, id: string) {
        const template = await this.prisma.runsheetTemplate.findFirst({
            where: { id, tenantId },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });

        if (!template) {
            throw new NotFoundException('Template not found');
        }

        return template;
    }

    async update(tenantId: string, id: string, dto: UpdateRunsheetTemplateDto) {
        // Verify ownership
        const template = await this.findOne(tenantId, id);

        return this.prisma.runsheetTemplate.update({
            where: { id: template.id },
            data: {
                name: dto.name,
                description: dto.description,
            },
            include: {
                items: {
                    orderBy: { idx: 'asc' }
                }
            }
        });
    }

    async delete(tenantId: string, id: string) {
        // Verify ownership
        const template = await this.findOne(tenantId, id);

        await this.prisma.runsheetTemplate.delete({
            where: { id: template.id }
        });
    }
}
