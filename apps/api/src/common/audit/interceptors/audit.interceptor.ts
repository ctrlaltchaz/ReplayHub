import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // Only audit state-changing operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Extract audit information
        const user = request.user;
        const tenantId = request.tenantId;
        const action = this.getActionFromMethodAndUrl(method, url);

        if (user && this.shouldAudit(url)) {
          this.auditService
            .log({
              organizationId: tenantId,
              userId: user.id,
              userType: user.type || 'org', // 'global' or 'org'
              action,
              resourceType: this.getResourceType(url),
              resourceId: this.getResourceId(url),
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            })
            .catch(error => {
              console.error('Failed to log audit entry:', error);
            });
        }
      })
    );
  }

  private getActionFromMethodAndUrl(method: string, url: string): string {
    const methodMap = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    const baseAction = methodMap[method] || 'unknown';

    // Add specific action context based on URL patterns
    if (url.includes('/roles')) {
      return `${baseAction}_role`;
    } else if (url.includes('/permissions')) {
      return `${baseAction}_permission`;
    } else if (url.includes('/users')) {
      return `${baseAction}_user`;
    }

    return baseAction;
  }

  private getResourceType(url: string): string {
    // Extract resource type from URL
    const pathParts = url.split('/');

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (['roles', 'users', 'events', 'teams', 'players'].includes(part)) {
        return part;
      }
    }

    return 'unknown';
  }

  private getResourceId(url: string): string | null {
    // Try to extract UUID from URL
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
  }

  private shouldAudit(url: string): boolean {
    // Define which endpoints should be audited
    const auditPatterns = [
      '/roles',
      '/permissions',
      '/users',
      '/teams',
      '/players',
      '/organizations',
    ];

    return auditPatterns.some(pattern => url.includes(pattern));
  }
}
