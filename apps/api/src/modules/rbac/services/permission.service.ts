import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface PermissionDefinition {
    key: string;
    group: string;
    description: string;
}

@Injectable()
export class PermissionService {
    constructor(private prisma: PrismaService) { }

    // Default permission definitions
    private readonly defaultPermissions: PermissionDefinition[] = [
        // Calendar permissions
        { key: 'calendar.view', group: 'calendar', description: 'View calendar events' },
        { key: 'calendar.manage', group: 'calendar', description: 'Manage calendar settings and events' },

        // Events permissions
        { key: 'events.view', group: 'events', description: 'View events' },
        { key: 'events.create', group: 'events', description: 'Create new events' },
        { key: 'events.edit', group: 'events', description: 'Edit existing events' },
        { key: 'events.delete', group: 'events', description: 'Delete events' },
        { key: 'events.manage', group: 'events', description: 'Full event management (create, edit, delete)' },

        // Runsheet permissions
        { key: 'runsheet.view', group: 'runsheet', description: 'View runsheets' },
        { key: 'runsheet.edit', group: 'runsheet', description: 'Edit runsheets' },
        { key: 'runsheet.approve', group: 'runsheet', description: 'Approve runsheets' },

        // Checklist permissions
        { key: 'checklists.run', group: 'checklists', description: 'Execute checklists' },
        { key: 'checklists.manage', group: 'checklists', description: 'Manage checklist templates' },

        // Inventory permissions
        { key: 'inventory.view', group: 'inventory', description: 'View inventory items' },
        { key: 'inventory.update', group: 'inventory', description: 'Update inventory status' },
        { key: 'inventory.book', group: 'inventory', description: 'Book inventory items' },

        // Asset permissions
        { key: 'assets.upload', group: 'assets', description: 'Upload assets' },
        { key: 'assets.approve', group: 'assets', description: 'Approve uploaded assets' },
        { key: 'assets.manage', group: 'assets', description: 'Manage asset library' },

        // Roster permissions
        { key: 'roster.view', group: 'roster', description: 'View team rosters' },
        { key: 'roster.manage', group: 'roster', description: 'Manage team rosters' },
        { key: 'team.create', group: 'roster', description: 'Create new teams' },
        { key: 'team.select_lineup', group: 'roster', description: 'Select team lineups' },

        // Player permissions
        { key: 'players.view', group: 'players', description: 'View player profiles' },
        { key: 'players.edit_profile_self', group: 'players', description: 'Edit own player profile' },
        { key: 'players.edit_admin', group: 'players', description: 'Edit any player profile' },

        // Achievement permissions
        { key: 'achievements.create', group: 'achievements', description: 'Create achievements' },
        { key: 'achievements.approve', group: 'achievements', description: 'Approve achievements' },

        // Game Log permissions
        { key: 'gamelog.view', group: 'gamelog', description: 'View match logs and results' },
        { key: 'gamelog.manage', group: 'gamelog', description: 'Create and edit match logs' },
        { key: 'gamelog.approve', group: 'gamelog', description: 'Approve match logs and lock editing' },

        // Player Stats permissions
        { key: 'stats.record', group: 'stats', description: 'Record player statistics' },
        { key: 'stats.edit', group: 'stats', description: 'Edit player statistics' },
        { key: 'stats.approve', group: 'stats', description: 'Approve player statistics' },

        // Reporting permissions
        { key: 'reports.view', group: 'reports', description: 'View reports' },
        { key: 'reports.export', group: 'reports', description: 'Export reports (PDF/CSV)' },
        { key: 'reports.export', group: 'reports', description: 'Export report data' },

        // Organisation settings
        { key: 'org.settings.view', group: 'org', description: 'View organisation settings' },
        { key: 'org.settings.manage', group: 'org', description: 'Manage organisation settings' },

        // Organisation admin permissions
        { key: 'org.users.view', group: 'org', description: 'View org users' },
        { key: 'org.users.manage', group: 'org', description: 'Manage org users' },
        { key: 'org.roles.view', group: 'org', description: 'View roles and permissions' },
        { key: 'org.roles.manage', group: 'org', description: 'Manage roles and permissions' },
        { key: 'org.invites.view', group: 'org', description: 'View invitations' },
        { key: 'org.invites.manage', group: 'org', description: 'Manage invitations' },
        { key: 'org.audit.view', group: 'org', description: 'View audit logs' },
    ];

    async getPermissionRegistry(tenantId: string): Promise<PermissionDefinition[]> {
        // Set tenant context
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const permissions = await this.prisma.permission.findMany({
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
    }

    async seedDefaultPermissions(tenantId: string): Promise<{ created: number }> {
        // Set tenant context
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        let created = 0;

        for (const permission of this.defaultPermissions) {
            try {
                await this.prisma.permission.create({
                    data: {
                        tenantId,
                        key: permission.key,
                        group: permission.group,
                        desc: permission.description,
                    },
                });
                created++;
            } catch (error) {
                // Permission already exists, skip
                continue;
            }
        }

        return { created };
    }

    async getUserPermissions(tenantId: string, orgUserId: string): Promise<string[]> {
        // Set tenant context
        await this.prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

        const userRoles = await this.prisma.orgUserRole.findMany({
            where: {
                tenantId,
                orgUserId,
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
        userRoles.forEach(userRole => {
            userRole.role.permissions.forEach(rolePermission => {
                permissions.add(rolePermission.permission.key);
            });
        });

        return Array.from(permissions);
    }

    async hasPermission(tenantId: string, orgUserId: string, requiredPermission: string): Promise<boolean> {
        const userPermissions = await this.getUserPermissions(tenantId, orgUserId);
        return userPermissions.includes(requiredPermission);
    }
}