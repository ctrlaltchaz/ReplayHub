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
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            return tx.checklistTemplate.create({
                data: {
                    tenantId,
                    title: createTemplateDto.title,
                    scope: createTemplateDto.scope,
                    itemsJson: createTemplateDto.itemsJson as any,
                    createdBy
                }
            });
        });
    }

    async findTemplates(tenantId: string, query: ChecklistTemplateQueryDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const where: any = { tenantId };

            if (query.scope) {
                where.scope = query.scope;
            }

            if (query.cursor) {
                where.id = { lt: query.cursor };
            }

            const limit = Math.min(query.limit || 20, 100);

            const items = await tx.checklistTemplate.findMany({
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
        });
    }

    async findTemplate(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const template = await tx.checklistTemplate.findFirst({
                where: { id, tenantId }
            });

            if (!template) {
                throw new NotFoundException('Checklist template not found');
            }

            return template;
        });
    }

    async updateTemplate(tenantId: string, id: string, updateTemplateDto: UpdateChecklistTemplateDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const existingTemplate = await tx.checklistTemplate.findFirst({
                where: { id, tenantId }
            });

            if (!existingTemplate) {
                throw new NotFoundException('Checklist template not found');
            }

            return tx.checklistTemplate.update({
                where: { id },
                data: {
                    title: updateTemplateDto.title,
                    scope: updateTemplateDto.scope,
                    itemsJson: updateTemplateDto.itemsJson as any,
                    version: existingTemplate.version + 1
                }
            });
        });
    }

    async deleteTemplate(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const existingTemplate = await tx.checklistTemplate.findFirst({
                where: { id, tenantId }
            });

            if (!existingTemplate) {
                throw new NotFoundException('Checklist template not found');
            }

            // Check if template is being used
            const activeChecklists = await tx.checklist.count({
                where: {
                    tenantId,
                    templateId: id,
                    status: { in: ['pending', 'in_progress'] }
                }
            });

            if (activeChecklists > 0) {
                throw new BadRequestException('Cannot delete template with active checklists');
            }

            return tx.checklistTemplate.delete({
                where: { id }
            });
        });
    }

    // Checklists

    async createChecklist(tenantId: string, createChecklistDto: CreateChecklistDto) {
        try {
            console.log('[createChecklist] Starting with:', JSON.stringify({ tenantId, dto: createChecklistDto }, null, 2));

            return await this.prisma.$transaction(async (tx) => {
                // Set tenant context for RLS
                console.log('[createChecklist] Setting RLS context...');
                await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
                console.log('[createChecklist] RLS context set successfully');

                // If templateId is provided, validate template exists
                if (createChecklistDto.templateId) {
                    console.log('[createChecklist] Looking for template:', createChecklistDto.templateId);
                    const template = await tx.checklistTemplate.findFirst({
                        where: { id: createChecklistDto.templateId, tenantId }
                    });

                    if (!template) {
                        throw new NotFoundException('Checklist template not found');
                    }

                    console.log('[createChecklist] Creating checklist from template...');
                    return tx.checklist.create({
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
                console.log('[createChecklist] Validating standalone checklist fields...');
                if (!createChecklistDto.title || !createChecklistDto.scope || !createChecklistDto.itemsJson) {
                    throw new BadRequestException('Title, scope, and items are required for standalone checklists');
                }

                console.log('[createChecklist] Creating standalone checklist...');
                return tx.checklist.create({
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
            });
        } catch (error) {
            console.error('[createChecklist] ERROR:', error);
            throw error;
        }
    }

    async findChecklists(tenantId: string, query: ChecklistQueryDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

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

            return tx.checklist.findMany({
                where,
                include: {
                    template: true
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    }

    async findChecklist(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const checklist = await tx.checklist.findFirst({
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
        });
    }

    async updateChecklist(tenantId: string, id: string, updateChecklistDto: UpdateChecklistDto) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const existingChecklist = await tx.checklist.findFirst({
                where: { id, tenantId }
            });

            if (!existingChecklist) {
                throw new NotFoundException('Checklist not found');
            }

            const updateData: any = { ...updateChecklistDto };
            if (updateChecklistDto.dueAt) {
                updateData.dueAt = new Date(updateChecklistDto.dueAt);
            }

            return tx.checklist.update({
                where: { id },
                data: updateData,
                include: {
                    template: true
                }
            });
        });
    }

    async deleteChecklist(tenantId: string, id: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const existingChecklist = await tx.checklist.findFirst({
                where: { id, tenantId }
            });

            if (!existingChecklist) {
                throw new NotFoundException('Checklist not found');
            }

            // Delete associated runs first
            await tx.checklistRun.deleteMany({
                where: {
                    tenantId,
                    checklistId: id
                }
            });

            // Delete the checklist
            return tx.checklist.delete({
                where: { id }
            });
        });
    }

    // Checklist Runs

    async createRun(tenantId: string, checklistId: string, createRunDto: CreateChecklistRunDto, runnerId: string, userId?: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            // Check if checklist exists
            const checklist = await tx.checklist.findFirst({
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

            // Create run
            const run = await tx.checklistRun.create({
                data: {
                    tenantId,
                    checklistId,
                    runnerId,
                    resultJson: createRunDto.resultJson as any
                }
            });

            // Update checklist status
            await tx.checklist.update({
                where: { id: checklistId },
                data: { status: newStatus }
            });

            return run;
        });
    }

    async getRuns(tenantId: string, checklistId: string) {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context for RLS
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            // Check if checklist exists
            const checklist = await tx.checklist.findFirst({
                where: { id: checklistId, tenantId }
            });

            if (!checklist) {
                throw new NotFoundException('Checklist not found');
            }

            return tx.checklistRun.findMany({
                where: {
                    tenantId,
                    checklistId
                },
                orderBy: { runAt: 'desc' }
            });
        });
    }
}