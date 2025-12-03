import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract slug from URL params
            const slug = req.params.slug;
            if (!slug) {
                throw new NotFoundException('Organisation not found');
            }

            // For org-scoped routes, we need different authentication logic
            const isAuthEndpoint = req.url.includes('/auth/');

            if (isAuthEndpoint) {
                // Just resolve the tenant for auth endpoints, no user validation needed
                const organisation = await this.prisma.organisation.findUnique({
                    where: { slug }
                });

                if (!organisation) {
                    throw new NotFoundException('Organisation not found');
                }

                req.tenant = {
                    id: organisation.id,
                    slug: organisation.slug,
                    name: organisation.name
                };

                console.log(`[TenantResolver] Resolved tenant for auth: ${req.tenant.slug} (${req.tenant.id}) for request to ${req.url}`);
                next();
                return;
            }

            // For non-auth org endpoints, resolve tenant and let OrgAuthGuard handle authentication
            // This allows org-specific authentication without requiring global authentication
            const organisation = await this.prisma.organisation.findUnique({
                where: { slug }
            });

            if (!organisation) {
                throw new NotFoundException('Organisation not found');
            }

            req.tenant = {
                id: organisation.id,
                slug: organisation.slug,
                name: organisation.name
            };

            console.log(`[TenantResolver] Resolved tenant for org endpoint: ${req.tenant.slug} (${req.tenant.id}) for request to ${req.url}`);
            next();
        } catch (error) {
            next(error);
        }
    }
}
