import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { DEFAULT_PERMISSION_DEFINITIONS, PermissionDefinition } from '../permission-definitions';

export type { PermissionDefinition } from '../permission-definitions';

@Injectable()
export class PermissionService {
    constructor(private prisma: PrismaService) { }

    private readonly defaultPermissions: PermissionDefinition[] = DEFAULT_PERMISSION_DEFINITIONS;

    async getPermissionRegistry(tenantId: string): Promise<PermissionDefinition[]> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const permissions = await tx.permission.findMany({
                where: { tenantId },
                select: {
                    key: true,
                    group: true,
                    desc: true,
                },
            });

            return permissions.map(p => ({
                key: p.key,
                group: p.group || 'general',
                description: p.desc || p.key,
            }));
        });
    }

    async seedDefaultPermissions(tenantId: string): Promise<{ created: number }> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            let created = 0;

            for (const permission of this.defaultPermissions) {
                try {
                    const existing = await tx.permission.findUnique({
                        where: {
                            tenantId_key: {
                                tenantId,
                                key: permission.key,
                            },
                        },
                    });

                    if (existing) {
                        await tx.permission.update({
                            where: { id: existing.id },
                            data: {
                                group: permission.group,
                                desc: permission.description,
                            },
                        });
                        continue;
                    }

                    await tx.permission.create({
                        data: {
                            tenantId,
                            key: permission.key,
                            group: permission.group,
                            desc: permission.description,
                        },
                    });
                    created++;
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    console.warn(`[PermissionService] Failed to seed permission ${permission.key} for tenant ${tenantId}: ${message}`);
                    continue;
                }
            }

            return { created };
        });
    }

    async getUserPermissions(tenantId: string, membershipId: string): Promise<string[]> {
        return await this.prisma.$transaction(async (tx) => {
            // Set tenant context
            await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            const membershipRoles = await tx.membershipRole.findMany({
                where: {
                    tenantId,
                    membershipId,
                },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: {
                                        select: {
                                            key: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // Flatten and deduplicate permissions
            const permissions = new Set<string>();
            membershipRoles.forEach(membershipRole => {
                membershipRole.role.permissions.forEach(rolePermission => {
                    permissions.add(rolePermission.permission.key);
                });
            });

            return Array.from(permissions);
        });
    }

    async hasPermission(tenantId: string, membershipId: string, requiredPermission: string): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(tenantId, membershipId);
        return userPermissions.includes(requiredPermission);
    }
}