import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
    ChecklistQueryDto,
    ChecklistTemplateQueryDto,
    CreateChecklistDto,
    CreateChecklistRunDto,
    CreateChecklistTemplateDto,
    UpdateChecklistDto,
    UpdateChecklistTemplateDto
} from '../dto';

@Injectable()
export class ChecklistService {
    constructor(private prisma: PrismaService) { }

    // Checklist Templates

    async createTemplate(tenantId: string, createTemplateDto: CreateChecklistTemplateDto, createdBy: string) {
        return this.prisma.checklistTemplate.create({
            data: {
                tenantId,
                title: createTemplateDto.title,
                scope: createTemplateDto.scope,
                itemsJson: createTemplateDto.itemsJson as any,
                createdBy
            }
        });
    }

    async findTemplates(tenantId: string, query: ChecklistTemplateQueryDto) {
        const where: any = { tenantId };

        if (query.scope) {
            where.scope = query.scope;
        }

        if (query.cursor) {
            where.id = { lt: query.cursor };
        }

        const limit = Math.min(query.limit || 20, 100);

        const items = await this.prisma.checklistTemplate.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit + 1
        });

        const hasMore = items.length > limit;
        const templates = hasMore ? items.slice(0, -1) : items;
        const nextCursor = hasMore ? templates[templates.length - 1].id : null;

        return {
            data: templates,
            pagination: {
                hasMore,
                nextCursor
            }
        };
    }

    async findTemplate(tenantId: string, id: string) {
        const template = await this.prisma.checklistTemplate.findFirst({
            where: { id, tenantId }
        });

        if (!template) {
            throw new NotFoundException('Checklist template not found');
        }

        return template;
    }

    async updateTemplate(tenantId: string, id: string, updateTemplateDto: UpdateChecklistTemplateDto) {
        const existingTemplate = await this.prisma.checklistTemplate.findFirst({
            where: { id, tenantId }
        });

        if (!existingTemplate) {
            throw new NotFoundException('Checklist template not found');
        }

        return this.prisma.checklistTemplate.update({
            where: { id },
            data: {
                title: updateTemplateDto.title,
                scope: updateTemplateDto.scope,
                itemsJson: updateTemplateDto.itemsJson as any,
                version: existingTemplate.version + 1
            }
        });
    }

    async deleteTemplate(tenantId: string, id: string) {
        const existingTemplate = await this.prisma.checklistTemplate.findFirst({
            where: { id, tenantId }
        });

        if (!existingTemplate) {
            throw new NotFoundException('Checklist template not found');
        }

        // Check if template is being used
        const activeChecklists = await this.prisma.checklist.count({
            where: {
                tenantId,
                templateId: id,
                status: { in: ['pending', 'in_progress'] }
            }
        });

        if (activeChecklists > 0) {
            throw new BadRequestException('Cannot delete template with active checklists');
        }

        return this.prisma.checklistTemplate.delete({
            where: { id }
        });
    }

    // Checklists

    async createChecklist(tenantId: string, createChecklistDto: CreateChecklistDto) {
        // If templateId is provided, validate template exists
        if (createChecklistDto.templateId) {
            const template = await this.prisma.checklistTemplate.findFirst({
                where: { id: createChecklistDto.templateId, tenantId }
            });

            if (!template) {
                throw new NotFoundException('Checklist template not found');
            }

            return this.prisma.checklist.create({
                data: {
                    tenantId,
                    templateId: createChecklistDto.templateId,
                    scopeRef: createChecklistDto.scopeRef,
                    dueAt: createChecklistDto.dueAt ? new Date(createChecklistDto.dueAt) : null,
                    assigneeId: createChecklistDto.assigneeId
                },
                include: {
                    template: true
                }
            });
        }

        // Standalone checklist without template
        if (!createChecklistDto.title || !createChecklistDto.scope || !createChecklistDto.itemsJson) {
            throw new BadRequestException('Title, scope, and items are required for standalone checklists');
        }

        return this.prisma.checklist.create({
            data: {
                tenantId,
                title: createChecklistDto.title,
                scope: createChecklistDto.scope,
                itemsJson: createChecklistDto.itemsJson as any,
                scopeRef: createChecklistDto.scopeRef,
                dueAt: createChecklistDto.dueAt ? new Date(createChecklistDto.dueAt) : null,
                assigneeId: createChecklistDto.assigneeId
            }
        });
    }

    async findChecklists(tenantId: string, query: ChecklistQueryDto) {
        const where: any = { tenantId };

        if (query.status) {
            where.status = query.status;
        }

        if (query.scopeRef) {
            where.scopeRef = query.scopeRef;
        }

        if (query.assigneeId) {
            where.assigneeId = query.assigneeId;
        }

        return this.prisma.checklist.findMany({
            where,
            include: {
                template: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findChecklist(tenantId: string, id: string) {
        const checklist = await this.prisma.checklist.findFirst({
            where: { id, tenantId },
            include: {
                template: true,
                runs: {
                    orderBy: { runAt: 'desc' }
                }
            }
        });

        if (!checklist) {
            throw new NotFoundException('Checklist not found');
        }

        return checklist;
    }

    async updateChecklist(tenantId: string, id: string, updateChecklistDto: UpdateChecklistDto) {
        const existingChecklist = await this.prisma.checklist.findFirst({
            where: { id, tenantId }
        });

        if (!existingChecklist) {
            throw new NotFoundException('Checklist not found');
        }

        const updateData: any = { ...updateChecklistDto };
        if (updateChecklistDto.dueAt) {
            updateData.dueAt = new Date(updateChecklistDto.dueAt);
        }

        return this.prisma.checklist.update({
            where: { id },
            data: updateData,
            include: {
                template: true
            }
        });
    }

    async deleteChecklist(tenantId: string, id: string) {
        const existingChecklist = await this.prisma.checklist.findFirst({
            where: { id, tenantId }
        });

        if (!existingChecklist) {
            throw new NotFoundException('Checklist not found');
        }

        // Delete associated runs first
        await this.prisma.checklistRun.deleteMany({
            where: {
                tenantId,
                checklistId: id
            }
        });

        // Delete the checklist
        return this.prisma.checklist.delete({
            where: { id }
        });
    }

    // Checklist Runs

    async createRun(tenantId: string, checklistId: string, createRunDto: CreateChecklistRunDto, runnerId: string, userId?: string) {
        // Check if checklist exists
        const checklist = await this.prisma.checklist.findFirst({
            where: { id: checklistId, tenantId },
            include: { template: true }
        });

        if (!checklist) {
            throw new NotFoundException('Checklist not found');
        }

        // Permission check: runner can run if assignee=self or user has checklists.manage
        // This permission logic will be handled in the controller with proper guards

        // Validate result format matches template
        const templateItems = checklist.template.itemsJson as any[];
        const maxIdx = templateItems.length - 1;

        for (const resultItem of createRunDto.resultJson) {
            if (resultItem.idx < 0 || resultItem.idx > maxIdx) {
                throw new BadRequestException(`Invalid item index: ${resultItem.idx}`);
            }
        }

        // Update checklist status based on results
        const allPassed = createRunDto.resultJson.every(item => item.pass);
        const newStatus = allPassed ? 'done' : 'failed';

        // Create run and update checklist in transaction
        const result = await this.prisma.$transaction([
            this.prisma.checklistRun.create({
                data: {
                    tenantId,
                    checklistId,
                    runnerId,
                    resultJson: createRunDto.resultJson as any
                }
            }),
            this.prisma.checklist.update({
                where: { id: checklistId },
                data: { status: newStatus }
            })
        ]);

        return result[0]; // Return the run
    }

    async getRuns(tenantId: string, checklistId: string) {
        // Check if checklist exists
        const checklist = await this.prisma.checklist.findFirst({
            where: { id: checklistId, tenantId }
        });

        if (!checklist) {
            throw new NotFoundException('Checklist not found');
        }

        return this.prisma.checklistRun.findMany({
            where: {
                tenantId,
                checklistId
            },
            orderBy: { runAt: 'desc' }
        });
    }
}