import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UnifiedSessionGuard } from '../../universal-auth/guards/unified-session.guard';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private readonly unifiedSessionGuard: UnifiedSessionGuard) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        await this.unifiedSessionGuard.canActivate(context);

        const request = context.switchToHttp().getRequest<Request>();
        const profile = request.unifiedUser;

        if (!profile?.hasGlobalAccount) {
            throw new UnauthorizedException('Global session required');
        }

        return true;
    }
}