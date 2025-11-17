import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if user is authenticated (either global or org session)
    const hasGlobalSession = !!request.session?.userId;
    const hasOrgSession = !!request.session?.membershipId;

    if (!hasGlobalSession && !hasOrgSession) {
      throw new UnauthorizedException('Authentication required');
    }

    // Check if tenant was resolved by middleware
    if (!request.tenant) {
      // This could mean the org wasn't found or user doesn't have access
      // The middleware should have thrown the appropriate error, but if we get here:
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
