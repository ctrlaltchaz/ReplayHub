import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { PermissionService } from '../rbac/services/permission.service';
import { RoleService } from '../rbac/services/role.service';

@Injectable()
export class OrganisationProvisioningService {
    private readonly logger = new Logger(OrganisationProvisioningService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly permissionService: PermissionService,
        private readonly roleService: RoleService,
    ) { }

    async provisionNewOrganisation(tenantId: string, ownerUserId: string) {
        const permissionResult = await this.permissionService.seedDefaultPermissions(tenantId);
        const roleResult = await this.roleService.seedDefaultRoles(tenantId);

        await this.ensureTenantUserWithRole(tenantId, ownerUserId, 'ADMIN');
        await this.ensureTenantUserWithRole(tenantId, ownerUserId, 'ops_admin');

        this.logger.log(`Provisioned organisation ${tenantId}: permissions=${permissionResult.created}, roles=${roleResult.created.length}`);
    }

    async ensureTenantUserWithRole(tenantId: string, rootUserId: string, roleName: string = 'ops_admin') {
        const rootUser = await this.prisma.globalUser.findUnique({ where: { id: rootUserId } });
        if (!rootUser) {
            this.logger.warn(`User ${rootUserId} not found while provisioning ${tenantId}`);
            return;
        }

        await this.prisma.$transaction(async (tx) => {
            await (tx as any).$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

            // Create or find UserOrganisationMembership (NEW)
            let membership = await tx.userOrganisationMembership.findFirst({
                where: {
                    tenantId,
                    userId: rootUser.id,
                },
            });

            if (!membership) {
                const displayName = rootUser.name || rootUser.email?.split('@')[0] || 'Member';

                membership = await tx.userOrganisationMembership.create({
                    data: {
                        tenantId,
                        userId: rootUser.id,
                        email: rootUser.email,
                        displayName,
                        isActive: true,
                        isTotpEnabled: false,
                    },
                });

                this.logger.log(`Created UserOrganisationMembership for ${rootUser.email} in tenant ${tenantId}`);
            }

            // Legacy: Create or find OrgUser
            let tenantUser = await tx.orgUser.findFirst({
                where: {
                    tenantId,
                    OR: [
                        { globalUserId: rootUser.id },
                        { email: rootUser.email },
                    ],
                },
            });

            if (!tenantUser) {
                const randomPassword = crypto.randomBytes(24).toString('hex');
                const passwordHash = await bcrypt.hash(randomPassword, 12);
                const displayName = rootUser.name || rootUser.email?.split('@')[0] || 'Member';

                tenantUser = await tx.orgUser.create({
                    data: {
                        tenantId,
                        globalUserId: rootUser.id,
                        email: rootUser.email,
                        passwordHash: rootUser.passwordHash ?? passwordHash,
                        displayName,
                        isActive: true,
                    },
                });
            } else if (!tenantUser.globalUserId) {
                tenantUser = await tx.orgUser.update({
                    where: { id: tenantUser.id },
                    data: { globalUserId: rootUser.id },
                });
            }

            const role = await tx.role.findFirst({
                where: {
                    tenantId,
                    name: roleName,
                },
            });

            if (!role) {
                this.logger.warn(`Role ${roleName} not found for tenant ${tenantId}`);
                return;
            }

            // NEW: Create MembershipRole
            await tx.membershipRole.upsert({
                where: {
                    tenantId_membershipId_roleId: {
                        tenantId,
                        membershipId: membership.id,
                        roleId: role.id,
                    },
                },
                update: {},
                create: {
                    tenantId,
                    membershipId: membership.id,
                    roleId: role.id,
                },
            });

            // Legacy: Create OrgUserRole
            await tx.orgUserRole.upsert({
                where: {
                    tenantId_orgUserId_roleId: {
                        tenantId,
                        orgUserId: tenantUser.id,
                        roleId: role.id,
                    },
                },
                update: {},
                create: {
                    tenantId,
                    orgUserId: tenantUser.id,
                    roleId: role.id,
                },
            });

            this.logger.log(`Assigned role ${roleName} to ${rootUser.email} in tenant ${tenantId}`);
        });
    }
    async ensureOrgUserWithRole(tenantId: string, rootUserId: string, roleName: string = 'ops_admin') {
        return this.ensureTenantUserWithRole(tenantId, rootUserId, roleName);
    }
}

