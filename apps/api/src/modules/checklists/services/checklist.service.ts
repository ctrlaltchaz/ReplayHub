import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
    ChecklistQueryDto,
    ChecklistTaskQueryDto,
    ChecklistTemplateQueryDto,
    CreateChecklistDto,
    CreateChecklistRunDto,
    CreateChecklistTemplateDto,
    UpdateChecklistDto,
    UpdateChecklistTemplateDto
} from '../dto';

export interface ChecklistTask {
    id: string;
    checklistId: string;
    checklistTitle: string | null;
    checklistScope?: string | null;
    templateId?: string | null;
    templateTitle?: string | null;
    itemIndex: number;
    title: string;
    category?: string | null;
    priority?: 'low' | 'medium' | 'high' | null;
    required: boolean;
    evidence: boolean;
    estimatedMinutes?: number | null;
    dueAt?: string | null;
    checklistStatus: string;
    checklistAssigneeId?: string | null;
    assignedOrgUserId?: string | null;
    completedAt?: string | null;
    completedBy?: string | null;
    scopeRef?: string | null;
}

export interface ChecklistTaskResponse {
    data: ChecklistTask[];
    pagination: {
        hasMore: boolean;
        nextCursor: string | null;
    };
}

@Injectable()
export class ChecklistService {
    constructor(private prisma: PrismaService) { }

    private async autoCompleteExpiredChecklists(tx: Prisma.TransactionClient, tenantId: string) {
        const now = new Date();
        await tx.checklist.updateMany({
            where: {
                tenantId,
                dueAt: { lt: now },
                status: { in: ['pending', 'in_progress'] },
            },
            data: { status: 'done' },
        });
    }

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
                            title: createChecklistDto.title ?? null,
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
            await this.autoCompleteExpiredChecklists(tx, tenantId);

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

    async findAssignedTasks(
        tenantId: string,
        orgUserMembershipId: string,
        query: ChecklistTaskQueryDto = {},
        globalUserId?: string,
        orgUserEmail?: string,
    ): Promise<ChecklistTaskResponse> {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
            await this.autoCompleteExpiredChecklists(tx, tenantId);

            const limit = Math.min(query.limit ?? 25, 100);
            const statusFilter = query.status ?? 'open';
            const dueBefore = query.dueBefore ? new Date(query.dueBefore) : undefined;
            const dueAfter = query.dueAfter ? new Date(query.dueAfter) : undefined;
            const cursorParts = query.cursor?.split('|');
            const cursorSortKey = cursorParts && cursorParts.length === 3 ? new Date(cursorParts[0]) : undefined;
            const cursorChecklistId = cursorParts && cursorParts.length === 3 ? cursorParts[1] : undefined;
            const cursorItemIdx = cursorParts && cursorParts.length === 3 ? Number(cursorParts[2]) : undefined;
            const isValidCursor = cursorSortKey instanceof Date && !isNaN(cursorSortKey.valueOf())
                && cursorChecklistId && cursorChecklistId.length > 0
                && typeof cursorItemIdx === 'number' && !isNaN(cursorItemIdx);

            const assignmentIdSet = new Set<string>();
            if (orgUserMembershipId) assignmentIdSet.add(orgUserMembershipId);
            if (globalUserId) assignmentIdSet.add(globalUserId);

            const orgUserWhere: Prisma.OrgUserWhereInput[] = [];
            if (orgUserEmail) {
                orgUserWhere.push({ email: orgUserEmail });
            }
            if (globalUserId) {
                orgUserWhere.push({ globalUserId });
            }

            if (orgUserWhere.length > 0) {
                const linkedOrgUsers = await tx.orgUser.findMany({
                    where: {
                        tenantId,
                        OR: orgUserWhere,
                    },
                    select: { id: true },
                });
                linkedOrgUsers.forEach((user) => assignmentIdSet.add(user.id));
            }

            const assignmentMatchIds = Array.from(assignmentIdSet).filter(Boolean);

            const itemAssignmentClauses = assignmentMatchIds.length
                ? assignmentMatchIds.map((id) => Prisma.sql`task_rows.assigned_to = ${id}`)
                : [Prisma.sql`FALSE`];

            const combinedItemAssignment =
                itemAssignmentClauses.length > 1
                    ? Prisma.sql`(${Prisma.join(itemAssignmentClauses, ' OR ')})`
                    : itemAssignmentClauses[0];

            const checklistAssigneeClauses = assignmentMatchIds.length
                ? assignmentMatchIds.map((id) => Prisma.sql`task_rows.checklist_assignee_id = ${id}`)
                : [];

            const combinedChecklistAssignee =
                checklistAssigneeClauses.length > 1
                    ? Prisma.sql`(${Prisma.join(checklistAssigneeClauses, ' OR ')})`
                    : checklistAssigneeClauses[0];

            const checklistFallbackClause = combinedChecklistAssignee
                ? Prisma.sql`
                    OR (
                        task_rows.assigned_to IS NULL
                        AND ${combinedChecklistAssignee}
                    )
                `
                : Prisma.sql``;

            const filters: Prisma.Sql[] = [
                Prisma.sql`(
                    ${combinedItemAssignment}
                    ${checklistFallbackClause}
                )`,
            ];

            if (statusFilter === 'completed') {
                filters.push(Prisma.sql`task_rows.completed_at IS NOT NULL`);
            } else {
                filters.push(Prisma.sql`task_rows.completed_at IS NULL`);
            }

            if (query.priority) {
                filters.push(Prisma.sql`task_rows.priority = ${query.priority}`);
            }

            if (dueBefore && !isNaN(dueBefore.valueOf())) {
                filters.push(Prisma.sql`task_rows.due_at IS NOT NULL AND task_rows.due_at <= ${dueBefore}`);
            }

            if (dueAfter && !isNaN(dueAfter.valueOf())) {
                filters.push(Prisma.sql`task_rows.due_at IS NOT NULL AND task_rows.due_at >= ${dueAfter}`);
            }

            if (query.search) {
                const like = `%${query.search.trim()}%`;
                filters.push(Prisma.sql`(task_rows.item_title ILIKE ${like} OR task_rows.checklist_title ILIKE ${like})`);
            }

            if (isValidCursor && cursorSortKey && cursorChecklistId && cursorItemIdx !== undefined) {
                filters.push(Prisma.sql`
                    (task_rows.sort_key, task_rows.checklist_id, task_rows.item_index)
                        > (${cursorSortKey}, ${cursorChecklistId}, ${cursorItemIdx})
                `);
            }

            const whereClause = filters.length
                ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}`
                : Prisma.sql``;

            type ChecklistTaskRow = {
                task_id: string;
                checklist_id: string;
                template_id: string | null;
                template_title: string | null;
                checklist_title: string | null;
                checklist_scope: string | null;
                scope_ref: string | null;
                due_at: Date | null;
                checklist_status: string;
                checklist_assignee_id: string | null;
                created_at: Date;
                item_index: number;
                item_title: string;
                category: string | null;
                priority: 'low' | 'medium' | 'high' | null;
                required: boolean;
                evidence: boolean;
                estimated_minutes: number | null;
                assigned_to: string | null;
                completed_at: Date | null;
                completed_by: string | null;
                sort_key: Date;
            };

            const limitPlusOne = limit + 1;
            const rows = await tx.$queryRaw<ChecklistTaskRow[]>(Prisma.sql`
                SELECT
                    CONCAT(task_rows.checklist_id, ':', task_rows.item_index) AS task_id,
                    task_rows.checklist_id,
                    task_rows.template_id,
                    task_rows.template_title,
                    task_rows.checklist_title,
                    task_rows.checklist_scope,
                    task_rows.scope_ref,
                    task_rows.due_at,
                    task_rows.checklist_status,
                    task_rows.checklist_assignee_id,
                    task_rows.created_at,
                    task_rows.item_index,
                    task_rows.item_title,
                    task_rows.category,
                    task_rows.priority,
                    task_rows.required,
                    task_rows.evidence,
                    task_rows.estimated_minutes,
                    task_rows.assigned_to,
                    task_rows.completed_at,
                    task_rows.completed_by,
                    task_rows.sort_key
                FROM (
                    WITH checklist_items AS (
                        SELECT
                            c.id AS checklist_id,
                            c.tenant_id,
                            c.title AS checklist_title,
                            c.scope AS checklist_scope,
                            c.scope_ref,
                            c.due_at,
                            c.status AS checklist_status,
                            c.assignee_id AS checklist_assignee_id,
                            c.created_at,
                            c.completed_items,
                            ct.id AS template_id,
                            ct.title AS template_title,
                            COALESCE(c.items_json, ct.items_json) AS items_json
                        FROM checklists c
                        LEFT JOIN checklist_templates ct ON ct.id = c.template_id
                        WHERE c.tenant_id = ${tenantId}
                    ),
                    expanded AS (
                        SELECT
                            ci.checklist_id,
                            ci.template_id,
                            ci.checklist_title,
                            ci.checklist_scope,
                            ci.scope_ref,
                            ci.due_at,
                            ci.checklist_status,
                            ci.checklist_assignee_id,
                            ci.created_at,
                            ci.completed_items,
                            ci.template_title,
                            item.elem AS item_json,
                            (item.ordinality::int - 1) AS item_index
                        FROM checklist_items ci
                        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(ci.items_json, '[]'::jsonb)) WITH ORDINALITY AS item(elem, ordinality)
                    ),
                    expanded_with_completion AS (
                        SELECT
                            expanded.*,
                            completion.elem ->> 'completedAt' AS completed_at_raw,
                            completion.elem ->> 'completedBy' AS completed_by
                        FROM expanded
                        LEFT JOIN LATERAL (
                            SELECT elem
                            FROM jsonb_array_elements(COALESCE(expanded.completed_items, '[]'::jsonb)) elem
                            WHERE (elem ->> 'idx')::int = expanded.item_index
                            LIMIT 1
                        ) completion ON true
                    )
                    SELECT
                        expanded_with_completion.checklist_id,
                        expanded_with_completion.template_id,
                        expanded_with_completion.template_title,
                        expanded_with_completion.checklist_title,
                        expanded_with_completion.checklist_scope,
                        expanded_with_completion.scope_ref,
                        expanded_with_completion.due_at,
                        expanded_with_completion.checklist_status,
                        expanded_with_completion.checklist_assignee_id,
                        expanded_with_completion.created_at,
                        expanded_with_completion.item_index,
                        (expanded_with_completion.item_json ->> 'text') AS item_title,
                        (expanded_with_completion.item_json ->> 'category') AS category,
                        NULLIF(expanded_with_completion.item_json ->> 'priority', '') AS priority,
                        NULLIF(expanded_with_completion.item_json ->> 'assignedTo', '') AS assigned_to,
                        CASE
                            WHEN expanded_with_completion.item_json ? 'required' THEN (expanded_with_completion.item_json ->> 'required')::boolean
                            ELSE false
                        END AS required,
                        CASE
                            WHEN expanded_with_completion.item_json ? 'evidence' THEN (expanded_with_completion.item_json ->> 'evidence')::boolean
                            ELSE false
                        END AS evidence,
                        CASE
                            WHEN expanded_with_completion.item_json ? 'estimatedMinutes'
                                THEN NULLIF(expanded_with_completion.item_json ->> 'estimatedMinutes', '')::int
                            ELSE NULL
                        END AS estimated_minutes,
                        NULLIF(expanded_with_completion.completed_at_raw, '')::timestamptz AS completed_at,
                        expanded_with_completion.completed_by,
                        COALESCE(expanded_with_completion.due_at, expanded_with_completion.created_at) AS sort_key
                    FROM expanded_with_completion
                ) AS task_rows
                ${whereClause}
                ORDER BY task_rows.sort_key ASC, task_rows.checklist_id ASC, task_rows.item_index ASC
                LIMIT ${limitPlusOne}
            `);

            const hasMore = rows.length > limit;
            const sliced = hasMore ? rows.slice(0, -1) : rows;
            const tasks: ChecklistTask[] = sliced.map((row) => ({
                id: row.task_id,
                checklistId: row.checklist_id,
                templateId: row.template_id,
                templateTitle: row.template_title,
                checklistTitle: row.checklist_title,
                checklistScope: row.checklist_scope,
                scopeRef: row.scope_ref,
                dueAt: row.due_at ? row.due_at.toISOString() : null,
                checklistStatus: row.checklist_status,
                checklistAssigneeId: row.checklist_assignee_id,
                assignedOrgUserId: row.assigned_to,
                itemIndex: row.item_index,
                title: row.item_title,
                category: row.category,
                priority: row.priority,
                required: row.required,
                evidence: row.evidence,
                estimatedMinutes: row.estimated_minutes,
                completedAt: row.completed_at ? row.completed_at.toISOString() : null,
                completedBy: row.completed_by,
            }));

            const lastRow = hasMore ? sliced[sliced.length - 1] : sliced[sliced.length - 1];
            const nextCursor = hasMore && lastRow
                ? `${lastRow.sort_key.toISOString()}|${lastRow.checklist_id}|${lastRow.item_index}`
                : null;

            return {
                data: tasks,
                pagination: {
                    hasMore,
                    nextCursor,
                },
            };
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

    async updateChecklistCompletedItems(tenantId: string, id: string, completedItems: any[]) {
        return await this.prisma.$transaction(async (tx) => {
            await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;

            const checklist = await tx.checklist.findFirst({
                where: { id, tenantId },
            });

            if (!checklist) {
                throw new NotFoundException('Checklist not found');
            }

            return tx.checklist.update({
                where: { id },
                data: {
                    completedItems: completedItems as any,
                },
                include: {
                    template: true,
                },
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
