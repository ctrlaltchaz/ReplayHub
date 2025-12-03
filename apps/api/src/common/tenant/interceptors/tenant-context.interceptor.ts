import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<Request>();

        // If tenant is resolved, set the database context
        if (request.tenant) {
            try {
                // Set the app.current_tenant_id config for Row-Level Security
                await this.prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${request.tenant.id}, true)`;

                console.log(`[TenantContext] Set app.current_tenant_id = ${request.tenant.id} for request to ${request.url}`);
            } catch (error) {
                console.error('[TenantContext] Failed to set tenant context:', error);
                throw error;
            }
        }

        return next.handle();
    }
}
