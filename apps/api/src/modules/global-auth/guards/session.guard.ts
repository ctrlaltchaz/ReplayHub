import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        requiresTotp?: boolean;
        totpVerified?: boolean;
    }
}

@Injectable()
export class SessionGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        if (!request.session?.userId) {
            throw new UnauthorizedException('Not authenticated');
        }

        // If user has 2FA enabled, check if TOTP is verified for this session
        if (request.session.requiresTotp && !request.session.totpVerified) {
            throw new UnauthorizedException('TOTP verification required');
        }

        return true;
    }
}