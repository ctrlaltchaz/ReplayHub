import { UnifiedOrgMembership, UnifiedUserProfile } from '../modules/users/dto/unified-user.dto';
import { RequestGlobalUser, RequestOrgUser, RequestPrincipal, RequestUserIdentity, TenantData } from './request-context';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        membershipId?: string; // Renamed from orgUserId
        orgTenant?: string;
        requiresTotp?: boolean;
        totpVerified?: boolean;
    }
}

declare global {
    namespace Express {
        interface Request {
            tenant?: TenantData;
            orgUser?: RequestOrgUser;
            principal?: RequestPrincipal;
            globalUser?: RequestGlobalUser;
            unifiedUser?: UnifiedUserProfile;
            activeMembership?: UnifiedOrgMembership | null;
            user?: RequestUserIdentity;
        }
    }
}

export { };

