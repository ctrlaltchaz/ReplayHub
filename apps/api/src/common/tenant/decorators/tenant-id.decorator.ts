import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  // Try multiple sources for tenant ID
  return request.tenantId || request.principal?.tenantId || request.tenant?.id;
});
