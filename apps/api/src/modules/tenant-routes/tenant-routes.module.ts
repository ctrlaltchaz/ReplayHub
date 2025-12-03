import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TenantResolverMiddleware } from '../../common/tenant/middleware/tenant-resolver.middleware';

@Module({})
export class TenantRoutesModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantResolverMiddleware)
            .forRoutes({ path: 'org/:slug/*', method: RequestMethod.ALL });
    }
}
