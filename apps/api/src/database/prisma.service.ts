import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaTenantMiddleware } from '../common/tenant/middleware/prisma-tenant-simple.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private tenantMiddleware = new PrismaTenantMiddleware();

    async onModuleInit() {
        await this.$connect();

        // Apply tenant isolation middleware
        this.tenantMiddleware.apply(this);
        console.log('[PrismaService] Connected with tenant isolation middleware');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
