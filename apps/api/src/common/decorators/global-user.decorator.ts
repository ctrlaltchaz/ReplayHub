import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract global user ID from request
 * Works with UnifiedTenantAuthGuard which sets req.globalUser
 */
export const GlobalUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        if (request.globalUser?.id) {
            return request.globalUser.id;
        }

        if (request.unifiedUser?.hasGlobalAccount) {
            return request.unifiedUser.id;
        }

        return undefined;
    },
);

/**
 * Decorator to extract full global user object from request
 */
export const GlobalUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        if (request.globalUser) {
            return request.globalUser;
        }

        if (request.unifiedUser?.hasGlobalAccount) {
            return {
                id: request.unifiedUser.id,
                email: request.unifiedUser.email,
                name: request.unifiedUser.name ?? request.unifiedUser.email,
                isGlobalAdmin: request.unifiedUser.isGlobalAdmin,
            };
        }

        return undefined;
    },
);
