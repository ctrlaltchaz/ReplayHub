import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'INVITE' | 'ACCEPT_INVITE' | 'REVOKE_INVITE';
type AuditEntityType = 'GLOBAL_USER' | 'ORGANISATION' | 'ORG_USER' | 'ORG_USER_ROLE' | 'ROLE' | 'PERMISSION' | 'ORG_INVITE';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private prisma: PrismaService) { }

    async logAction(params: {
        action: AuditAction;
        entityType: AuditEntityType;
        entityId: string;
        userId?: string;
        orgUserId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<void> {
        try {
            const { action, entityType, entityId, userId, orgUserId, details, ipAddress, userAgent } = params;

            // Get tenant ID from RLS context - for now we'll pass it as a parameter
            const tenantId = await this.prisma.$queryRaw<{ current_setting: string }[]>`
        SELECT current_setting('app.tenant_id') as current_setting
      `.then(result => result[0]?.current_setting || 'default');

            await this.prisma.auditLog.create({
                data: {
                    tenantId,
                    action,
                    entityType,
                    entityId,
                    userId,
                    orgUserId,
                    details: details ? JSON.stringify(details) : null,
                    ipAddress,
                    userAgent,
                },
            });

            this.logger.log(
                `Audit: ${action} ${entityType} ${entityId} by ${orgUserId || userId || 'system'}`,
            );
        } catch (error) {
            this.logger.error('Failed to create audit log', error);
            // Don't throw - audit failures shouldn't break business logic
        }
    }

    // Convenience methods for common org user actions
    async logOrgUserCreated(orgUserId: string, createdBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'CREATE',
            entityType: 'ORG_USER',
            entityId: orgUserId,
            orgUserId: createdBy,
            details,
        });
    }

    async logOrgUserUpdated(orgUserId: string, updatedBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'UPDATE',
            entityType: 'ORG_USER',
            entityId: orgUserId,
            orgUserId: updatedBy,
            details,
        });
    }

    async logOrgUserDeactivated(orgUserId: string, deactivatedBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'DELETE',
            entityType: 'ORG_USER',
            entityId: orgUserId,
            orgUserId: deactivatedBy,
            details,
        });
    }

    async logRoleAssigned(orgUserId: string, roleId: string, assignedBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'CREATE',
            entityType: 'ORG_USER_ROLE',
            entityId: `${orgUserId}-${roleId}`,
            orgUserId: assignedBy,
            details: { ...details, orgUserId, roleId },
        });
    }

    async logRoleRevoked(orgUserId: string, roleId: string, revokedBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'DELETE',
            entityType: 'ORG_USER_ROLE',
            entityId: `${orgUserId}-${roleId}`,
            orgUserId: revokedBy,
            details: { ...details, orgUserId, roleId },
        });
    }

    async logInviteCreated(inviteId: string, createdBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'CREATE',
            entityType: 'ORG_INVITE',
            entityId: inviteId,
            orgUserId: createdBy,
            details,
        });
    }

    async logInviteAccepted(inviteId: string, acceptedBy?: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'UPDATE',
            entityType: 'ORG_INVITE',
            entityId: inviteId,
            orgUserId: acceptedBy,
            details,
        });
    }

    async logInviteRevoked(inviteId: string, revokedBy: string, details?: Record<string, any>) {
        return this.logAction({
            action: 'DELETE',
            entityType: 'ORG_INVITE',
            entityId: inviteId,
            orgUserId: revokedBy,
            details,
        });
    }

    async logOrgLogin(orgUserId: string, ipAddress?: string, userAgent?: string) {
        return this.logAction({
            action: 'LOGIN',
            entityType: 'ORG_USER',
            entityId: orgUserId,
            orgUserId,
            ipAddress,
            userAgent,
        });
    }

    async logOrgLogout(orgUserId: string, ipAddress?: string, userAgent?: string) {
        return this.logAction({
            action: 'LOGOUT',
            entityType: 'ORG_USER',
            entityId: orgUserId,
            orgUserId,
            ipAddress,
            userAgent,
        });
    }

    // Query audit logs with proper tenant isolation
    async getAuditLogs(params: {
        entityType?: AuditEntityType;
        entityId?: string;
        userId?: string;
        orgUserId?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }) {
        const {
            entityType,
            entityId,
            userId,
            orgUserId,
            startDate,
            endDate,
            page = 1,
            limit = 50,
        } = params;

        const where: any = {};

        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (userId) where.userId = userId;
        if (orgUserId) where.orgUserId = orgUserId;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: { id: true, email: true },
                    },
                    orgUser: {
                        select: { id: true, email: true, displayName: true },
                    },
                },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}