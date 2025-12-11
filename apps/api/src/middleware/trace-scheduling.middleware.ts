import { NextFunction, Request, Response } from 'express';

export function traceScheduling(req: Request, res: Response, next: NextFunction) {
    // Debug logging disabled - uncomment if needed for troubleshooting
    // if (/^\/api\/org\/[^/]+\/(events|resources|bookings|calendar)/.test(req.originalUrl)) {
    //     console.log('[TRACE] =====  SCHEDULING REQUEST =====');
    //     console.log('[TRACE] path=', req.originalUrl);
    //     console.log('[TRACE] method=', req.method);
    //     console.log('[TRACE] cookies=', Object.keys(req.cookies || {}));
    //     console.log('[TRACE] sessionID=', (req.session as any)?.id);
    //     console.log('[TRACE] sess.orgUserId=', (req.session as any)?.orgUserId);
    //     console.log('[TRACE] sess.userId=', (req.session as any)?.userId);
    //     console.log('[TRACE] session object=', req.session ? 'exists' : 'missing');
    //     console.log('[TRACE] full session=', JSON.stringify(req.session, null, 2));
    //     console.log('[TRACE] tenant=', (req as any).tenant?.id);
    //     console.log('[TRACE] principal=', (req as any).principal?.type);
    //     console.log('[TRACE] =====================================');
    // }
    next();
}
