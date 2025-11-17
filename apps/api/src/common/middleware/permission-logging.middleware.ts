import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class PermissionLoggingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const originalPath = req.path;

        // Only log for inventory/assets routes
        if (originalPath.includes('/inventory/') || originalPath.includes('/assets/')) {
            const startTime = Date.now();

            // Log request info
            console.log('🔍 PERMISSION LOG START:', {
                timestamp: new Date().toISOString(),
                method: req.method,
                path: originalPath,
                membershipId: req.session?.membershipId || 'NO_MEMBERSHIP_SESSION',
                tenantId: req.tenant?.id || 'NO_TENANT',
                orgUserEmail: req.orgUser?.email || 'NO_ORG_USER'
            });

            // Store original json method to intercept response
            const originalJson = res.json;
            res.json = function (body) {
                const duration = Date.now() - startTime;

                // Extract permission from @Can decorator if available
                let permissionKey = 'UNKNOWN';
                try {
                    // This would be set by PermissionGuard during execution
                    if (req['permissionKey']) {
                        permissionKey = req['permissionKey'];
                    }
                } catch (e) {
                    // Ignore errors
                }

                console.log('✅ PERMISSION LOG END:', {
                    timestamp: new Date().toISOString(),
                    method: req.method,
                    path: originalPath,
                    statusCode: res.statusCode,
                    duration: `${duration}ms`,
                    permissionRequired: permissionKey,
                    membershipId: req.session?.membershipId || 'NO_MEMBERSHIP_SESSION',
                    tenantId: req.tenant?.id || 'NO_TENANT',
                    orgUserEmail: req.orgUser?.email || 'NO_ORG_USER'
                });

                return originalJson.call(this, body);
            };
        }

        next();
    }
}