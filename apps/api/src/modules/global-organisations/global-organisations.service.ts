import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrgDto, OrganisationDto } from './dto';
import { OrganisationProvisioningService } from './organisation-provisioning.service';

@Injectable()
export class GlobalOrganisationsService {
    private readonly logger = new Logger(GlobalOrganisationsService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly provisioningService: OrganisationProvisioningService,
    ) { }

    async create(createOrgDto: CreateOrgDto, globalUserId: string): Promise<OrganisationDto> {
        // Check if slug already exists
        const existingOrg = await this.prisma.organisation.findUnique({
            where: { slug: createOrgDto.slug }
        });

        if (existingOrg) {
            throw new ConflictException('Organisation slug is already taken');
        }

        // Validate slug format (additional server-side validation)
        const slugPattern = /^[a-z0-9-]{2,40}$/;
        if (!slugPattern.test(createOrgDto.slug)) {
            throw new BadRequestException('Slug must contain only lowercase letters, numbers, and hyphens (2-40 characters)');
        }

        try {
            // Create organisation and admin record in a transaction
            const result = await this.prisma.$transaction(async (tx) => {
                // Create organisation
                const organisation = await tx.organisation.create({
                    data: {
                        name: createOrgDto.name,
                        slug: createOrgDto.slug,
                        branding: createOrgDto.brandingJson || {},
                        features: createOrgDto.featuresJson || {},
                        ownerId: globalUserId,
                    },
                });

                // Create OrganisationAdmin record
                await tx.organisationAdmin.create({
                    data: {
                        organisationId: organisation.id,
                        globalUserId: globalUserId,
                        role: 'owner',
                    },
                });

                return organisation;
            });

            const organisationDto: OrganisationDto = {
                id: result.id,
                name: result.name,
                slug: result.slug,
                brandingJson: result.branding,
                featuresJson: result.features,
                ownerId: result.ownerId,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                isOwner: true,
                isAdmin: true,
                role: 'owner',
            };

            try {
                await this.provisioningService.provisionNewOrganisation(result.id, globalUserId);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.logger.error(`Provisioning failed for organisation ${result.id}: ${message}`);
            }

            return organisationDto;
        } catch (error) {
            if ((error as any)?.code === 'P2002') {
                throw new ConflictException('Organisation slug is already taken');
            }
            throw error;
        }
    }

    async findAll(globalUserId: string): Promise<OrganisationDto[]> {
        // First, get all tenant IDs where user has access via OrgUser
        const orgUsers = await this.prisma.orgUser.findMany({
            where: { globalUserId: globalUserId },
            select: { tenantId: true }
        });

        const tenantIds = orgUsers.map(ou => ou.tenantId);

        // Find orgs where user is owner, admin, or has OrgUser access
        const organisations = await this.prisma.organisation.findMany({
            where: {
                OR: [
                    { ownerId: globalUserId },
                    {
                        admins: {
                            some: {
                                globalUserId: globalUserId
                            }
                        }
                    },
                    ...(tenantIds.length > 0 ? [{ id: { in: tenantIds } }] : [])
                ]
            },
            include: {
                admins: {
                    where: { globalUserId: globalUserId }
                }
            },
        });

        return organisations.map((org) => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            brandingJson: org.branding,
            featuresJson: org.features,
            ownerId: org.ownerId,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
            isOwner: org.ownerId === globalUserId,
            isAdmin: org.admins.length > 0,
            role: org.admins[0]?.role || (org.ownerId === globalUserId ? 'owner' : null),
        }));
    }

    async findBySlug(slug: string, globalUserId: string): Promise<OrganisationDto> {
        // Find org by slug and check if user is owner or admin
        const organisation = await this.prisma.organisation.findUnique({
            where: { slug },
            include: {
                admins: {
                    where: { globalUserId: globalUserId }
                }
            },
        });

        if (!organisation) {
            throw new NotFoundException('Organisation not found');
        }

        // Check if user is owner or admin
        const isOwner = organisation.ownerId === globalUserId;
        const isAdmin = organisation.admins.length > 0;

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException('Access denied to this organisation');
        }

        return {
            id: organisation.id,
            name: organisation.name,
            slug: organisation.slug,
            brandingJson: organisation.branding,
            featuresJson: organisation.features,
            ownerId: organisation.ownerId,
            createdAt: organisation.createdAt,
            updatedAt: organisation.updatedAt,
            isOwner,
            isAdmin,
            role: organisation.admins[0]?.role || (isOwner ? 'owner' : null),
        };
    }
}