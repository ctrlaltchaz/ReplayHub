import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../../../common/audit/audit.service';
import { PrismaService } from '../../../database/prisma.service';
import {
    CreateImprovementDto,
    ImprovementResponse,
    QueryImprovementsDto,
    UpdateImprovementDto,
} from '../dto/improvements.dto';

@Injectable()
export class ImprovementsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly auditService: AuditService
    ) { }

    async createImprovement(
        tenantId: string,
        reportedBy: string | null | undefined,
        dto: CreateImprovementDto,
        actorEmail?: string | null
    ): Promise<ImprovementResponse> {
        return await this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Resolve the reporter OrgUser ID
            const resolvedReporterId = await this.resolveActorOrgUserId(tenantId, reportedBy, actorEmail);
            if (!resolvedReporterId) {
                throw new NotFoundException('Reporter user not found in organization');
            }

            // Validate event exists if eventId provided
            if (dto.eventId) {
                const event = await tx.event.findFirst({
                    where: { id: dto.eventId, tenantId },
                });
                if (!event) {
                    throw new NotFoundException('Event not found');
                }
            }

            // Validate match exists if matchId provided
            if (dto.matchId) {
                const match = await tx.match.findFirst({
                    where: { id: dto.matchId, tenantId },
                });
                if (!match) {
                    throw new NotFoundException('Match not found');
                }
            }

            // Validate assignee exists if assignedTo provided
            if (dto.assignedTo) {
                const assignee = await tx.orgUser.findFirst({
                    where: { id: dto.assignedTo, tenantId, isActive: true },
                });
                if (!assignee) {
                    throw new NotFoundException('Assignee not found');
                }
            }

            const entry = await tx.improvementEntry.create({
                data: {
                    tenantId,
                    reportedBy: resolvedReporterId,
                    title: dto.title,
                    description: dto.description,
                    category: dto.category,
                    priority: dto.priority || 'medium',
                    eventId: dto.eventId,
                    matchId: dto.matchId,
                    vodUrl: dto.vodUrl,
                    vodTimestamp: dto.vodTimestamp,
                    screenshotUrl: dto.screenshotUrl,
                    whatWentWrong: dto.whatWentWrong,
                    rootCause: dto.rootCause,
                    proposedSolution: dto.proposedSolution,
                    platformType: dto.platformType,
                    postUrl: dto.postUrl,
                    engagementMetrics: dto.engagementMetrics,
                    assignedTo: dto.assignedTo,
                    tags: dto.tags,
                    impactLevel: dto.impactLevel,
                    occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : null,
                },
                include: {
                    event: {
                        select: { id: true, title: true, startAt: true },
                    },
                    match: {
                        select: { id: true, opponent: true, startedAt: true },
                    },
                    reporter: {
                        select: { id: true, displayName: true, email: true },
                    },
                    assignee: {
                        select: { id: true, displayName: true, email: true },
                    },
                },
            });

            await this.auditService.log({
                tenantId,
                action: 'improvement.create',
                entity: 'improvement',
                entityType: 'ORG_USER',
                entityId: entry.id,
                orgUserId: reportedBy,
                description: `Created improvement entry: ${entry.title}`,
                metadata: {
                    category: entry.category,
                    priority: entry.priority,
                    actorEmail,
                },
            });

            return this.mapEntryToResponse(entry);
        });
    }

    async findImprovements(
        tenantId: string,
        queryDto: QueryImprovementsDto
    ): Promise<{
        improvements: ImprovementResponse[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        return await this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const {
                page = 1,
                limit = 20,
                q,
                category,
                priority,
                status,
                impactLevel,
                from,
                to,
                eventId,
                matchId,
                reportedBy,
                assignedTo,
            } = queryDto;
            const skip = (page - 1) * limit;

            // Build where clause
            const where: any = { tenantId };

            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    { tags: { contains: q, mode: 'insensitive' } },
                ];
            }

            if (category) where.category = category;
            if (priority) where.priority = priority;
            if (status) where.status = status;
            if (impactLevel) where.impactLevel = impactLevel;
            if (eventId) where.eventId = eventId;
            if (matchId) where.matchId = matchId;
            if (reportedBy) where.reportedBy = reportedBy;
            if (assignedTo) where.assignedTo = assignedTo;

            if (from || to) {
                where.createdAt = {};
                if (from) where.createdAt.gte = new Date(from);
                if (to) where.createdAt.lte = new Date(to);
            }

            // Get total count
            const total = await tx.improvementEntry.count({ where });

            // Get entries with relations
            const entries = await tx.improvementEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    event: {
                        select: { id: true, title: true, startAt: true },
                    },
                    match: {
                        select: { id: true, opponent: true, startedAt: true },
                    },
                    reporter: {
                        select: { id: true, displayName: true, email: true },
                    },
                    assignee: {
                        select: { id: true, displayName: true, email: true },
                    },
                    implementer: {
                        select: { id: true, displayName: true, email: true },
                    },
                },
            });

            const totalPages = Math.ceil(total / limit);

            return {
                improvements: entries.map(entry => this.mapEntryToResponse(entry)),
                total,
                page,
                totalPages,
            };
        });
    }

    async findImprovementById(tenantId: string, id: string): Promise<ImprovementResponse> {
        return await this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const entry = await tx.improvementEntry.findFirst({
                where: { id, tenantId },
                include: {
                    event: {
                        select: { id: true, title: true, startAt: true },
                    },
                    match: {
                        select: { id: true, opponent: true, startedAt: true },
                    },
                    reporter: {
                        select: { id: true, displayName: true, email: true },
                    },
                    assignee: {
                        select: { id: true, displayName: true, email: true },
                    },
                    implementer: {
                        select: { id: true, displayName: true, email: true },
                    },
                },
            });

            if (!entry) {
                throw new NotFoundException('Improvement entry not found');
            }

            return this.mapEntryToResponse(entry);
        });
    }

    async updateImprovement(
        tenantId: string,
        id: string,
        dto: UpdateImprovementDto,
        updaterUserId: string,
        hasManagePermission: boolean,
        actorEmail?: string | null
    ): Promise<ImprovementResponse> {
        return await this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const existingEntry = await tx.improvementEntry.findFirst({
                where: { id, tenantId },
            });

            if (!existingEntry) {
                throw new NotFoundException('Improvement entry not found');
            }

            // Check permissions for restricted fields
            const restrictedFields = ['status', 'assignedTo', 'implementedBy', 'implementedAt'];
            const hasRestrictedChanges = restrictedFields.some(field => dto[field] !== undefined);

            if (hasRestrictedChanges && !hasManagePermission) {
                // Allow reporter to edit their own entry, but not restricted fields
                if (existingEntry.reportedBy !== updaterUserId) {
                    throw new ForbiddenException('Only managers can update status and assignments');
                }
            }

            // Validate references if provided
            if (dto.eventId) {
                const event = await tx.event.findFirst({
                    where: { id: dto.eventId, tenantId },
                });
                if (!event) {
                    throw new NotFoundException('Event not found');
                }
            }

            if (dto.matchId) {
                const match = await tx.match.findFirst({
                    where: { id: dto.matchId, tenantId },
                });
                if (!match) {
                    throw new NotFoundException('Match not found');
                }
            }

            if (dto.assignedTo) {
                const assignee = await tx.orgUser.findFirst({
                    where: { id: dto.assignedTo, tenantId, isActive: true },
                });
                if (!assignee) {
                    throw new NotFoundException('Assignee not found');
                }
            }

            const entry = await tx.improvementEntry.update({
                where: { id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    category: dto.category,
                    priority: dto.priority,
                    status: dto.status,
                    eventId: dto.eventId,
                    matchId: dto.matchId,
                    vodUrl: dto.vodUrl,
                    vodTimestamp: dto.vodTimestamp,
                    screenshotUrl: dto.screenshotUrl,
                    whatWentWrong: dto.whatWentWrong,
                    rootCause: dto.rootCause,
                    proposedSolution: dto.proposedSolution,
                    actualSolution: dto.actualSolution,
                    preventionSteps: dto.preventionSteps,
                    platformType: dto.platformType,
                    postUrl: dto.postUrl,
                    engagementMetrics: dto.engagementMetrics,
                    assignedTo: dto.assignedTo,
                    implementedBy: dto.implementedBy,
                    tags: dto.tags,
                    impactLevel: dto.impactLevel,
                    occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined,
                    implementedAt: dto.implementedAt ? new Date(dto.implementedAt) : undefined,
                },
                include: {
                    event: {
                        select: { id: true, title: true, startAt: true },
                    },
                    match: {
                        select: { id: true, opponent: true, startedAt: true },
                    },
                    reporter: {
                        select: { id: true, displayName: true, email: true },
                    },
                    assignee: {
                        select: { id: true, displayName: true, email: true },
                    },
                    implementer: {
                        select: { id: true, displayName: true, email: true },
                    },
                },
            });

            const changes: Record<string, any> = {};
            ['title', 'status', 'priority', 'assignedTo'].forEach(field => {
                const beforeVal = (existingEntry as any)[field];
                const afterVal = (entry as any)[field];
                if (dto[field as keyof UpdateImprovementDto] !== undefined && beforeVal !== afterVal) {
                    changes[field] = { before: beforeVal, after: afterVal };
                }
            });

            await this.auditService.log({
                tenantId,
                action: 'improvement.update',
                entity: 'improvement',
                entityType: 'ORG_USER',
                entityId: entry.id,
                orgUserId: updaterUserId,
                description: `Updated improvement entry: ${entry.title}`,
                metadata: {
                    changes,
                    actorEmail,
                },
            });

            return this.mapEntryToResponse(entry);
        });
    }

    async deleteImprovement(
        tenantId: string,
        id: string,
        actorOrgUserId: string,
        actorEmail?: string | null
    ): Promise<void> {
        await this.prisma.$transaction(async tx => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const entry = await tx.improvementEntry.findFirst({
                where: { id, tenantId },
            });

            if (!entry) {
                throw new NotFoundException('Improvement entry not found');
            }

            await tx.improvementEntry.delete({
                where: { id },
            });

            await this.auditService.log({
                tenantId,
                action: 'improvement.delete',
                entity: 'improvement',
                entityType: 'ORG_USER',
                entityId: id,
                orgUserId: actorOrgUserId,
                description: `Deleted improvement entry: ${entry.title}`,
                metadata: {
                    category: entry.category,
                    actorEmail,
                },
            });
        });
    }

    private mapEntryToResponse(entry: any): ImprovementResponse {
        return {
            id: entry.id,
            tenantId: entry.tenantId,
            title: entry.title,
            description: entry.description,
            category: entry.category,
            priority: entry.priority,
            status: entry.status,
            eventId: entry.eventId,
            matchId: entry.matchId,
            vodUrl: entry.vodUrl,
            vodTimestamp: entry.vodTimestamp,
            screenshotUrl: entry.screenshotUrl,
            whatWentWrong: entry.whatWentWrong,
            rootCause: entry.rootCause,
            proposedSolution: entry.proposedSolution,
            actualSolution: entry.actualSolution,
            preventionSteps: entry.preventionSteps,
            platformType: entry.platformType,
            postUrl: entry.postUrl,
            engagementMetrics: entry.engagementMetrics,
            reportedBy: entry.reportedBy,
            assignedTo: entry.assignedTo,
            implementedBy: entry.implementedBy,
            tags: entry.tags,
            impactLevel: entry.impactLevel,
            occurredAt: entry.occurredAt?.toISOString(),
            implementedAt: entry.implementedAt?.toISOString(),
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
            event: entry.event
                ? {
                    id: entry.event.id,
                    title: entry.event.title,
                    startAt: entry.event.startAt.toISOString(),
                }
                : undefined,
            match: entry.match
                ? {
                    id: entry.match.id,
                    opponent: entry.match.opponent,
                    startedAt: entry.match.startedAt?.toISOString(),
                }
                : undefined,
            reporter: entry.reporter
                ? {
                    id: entry.reporter.id,
                    displayName: entry.reporter.displayName,
                    email: entry.reporter.email,
                }
                : undefined,
            assignee: entry.assignee
                ? {
                    id: entry.assignee.id,
                    displayName: entry.assignee.displayName,
                    email: entry.assignee.email,
                }
                : undefined,
            implementer: entry.implementer
                ? {
                    id: entry.implementer.id,
                    displayName: entry.implementer.displayName,
                    email: entry.implementer.email,
                }
                : undefined,
        };
    }

    private async resolveActorOrgUserId(
        tenantId: string,
        actorOrgUserId?: string | null,
        actorEmail?: string | null
    ): Promise<string | null> {
        if (actorOrgUserId) {
            const found = await this.prisma.orgUser.findFirst({
                where: { id: actorOrgUserId, tenantId },
                select: { id: true },
            });
            if (found) {
                return actorOrgUserId;
            }
        }

        if (actorEmail) {
            const foundByEmail = await this.prisma.orgUser.findFirst({
                where: { tenantId, email: actorEmail },
                select: { id: true },
            });
            if (foundByEmail) {
                return foundByEmail.id;
            }
        }

        return null;
    }
}
