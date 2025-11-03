import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    console.log('[TenantGuard] Executing guard #1 in chain');
    const request = context.switchToHttp().getRequest<Request>();

    // Check if user is authenticated (either global or org session)
    const hasGlobalSession = !!request.session?.userId;
    const hasOrgSession = !!request.session?.orgUserId;

    console.log(`[TenantGuard] Session check - global: ${hasGlobalSession}, org: ${hasOrgSession}`);

    if (!hasGlobalSession && !hasOrgSession) {
      console.log('[TenantGuard] FAIL: No valid session found');
      throw new UnauthorizedException('Authentication required');
    }

    // Check if tenant was resolved by middleware
    if (!request.tenant) {
      console.log('[TenantGuard] FAIL: No tenant context found');
      // This could mean the org wasn't found or user doesn't have access
      // The middleware should have thrown the appropriate error, but if we get here:
      throw new ForbiddenException('Access denied');
    }

    console.log(`[TenantGuard] SUCCESS: Tenant ${request.tenant.slug} resolved, passing to next guard`);
    return true;
  }
}
