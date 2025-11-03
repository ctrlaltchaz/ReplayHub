import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract global user ID from request
 * Works with UnifiedTenantAuthGuard which sets req.globalUser
 */
export const GlobalUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.globalUser?.id || request.session?.userId;
    },
);

/**
 * Decorator to extract full global user object from request
 */
export const GlobalUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.globalUser;
    },
);
