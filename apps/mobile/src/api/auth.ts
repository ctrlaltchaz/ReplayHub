import { API_URL } from '../constants/env';

export interface UniversalOrgMembership {
  membershipId: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  email: string;
  displayName: string | null;
  isActive: boolean;
  isTotpEnabled: boolean;
}

export interface UniversalLoginResponse {
  success: boolean;
  userType: 'global' | 'org' | 'both';
  message: string;
  requiresTotp?: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    isGlobalAdmin: boolean;
    hasGlobalAccount: boolean;
    memberships: UniversalOrgMembership[];
    globalOrganisations?: Array<{ id: string; slug: string; name: string }>;
  };
  globalUser?: {
    id: string;
    email: string;
    isGlobalAdmin: boolean;
    organizations?: Array<{ id: string; slug: string; name: string }>;
  };
  orgAccounts?: Array<{
    id: string;
    tenantSlug: string;
    tenantName: string;
    email: string;
  }>;
}

export interface TotpVerifyRequest {
  token: string;
  userType: 'global' | 'org';
  tenantSlug?: string;
}

async function request<T>(
  path: string,
  body?: unknown,
  method: 'POST' | 'GET' = 'POST'
): Promise<T> {
  try {
    console.log('[API] Request', { path, method, API_URL });
    const res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        message = data?.message ?? message;
        console.log('[API] Error response body', data);
      } catch (error) {
        console.warn('[API] Failed to parse error response', error);
      }
      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json() as Promise<T>;
  } catch (error) {
    console.error('[API] Network failure', error);
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
}

export async function loginWithEmail(email: string, password: string, rememberMe: boolean) {
  return request<UniversalLoginResponse>('/auth/universal-login', { email, password, rememberMe });
}

export async function verifyTotpCode(payload: TotpVerifyRequest) {
  return request<UniversalLoginResponse>('/auth/universal-totp-verify', payload);
}

export async function logoutSession() {
  await request<void>('/global/auth/logout', undefined, 'POST');
}

export async function fetchSessionProfile() {
  return request('/auth/session', undefined, 'GET');
}
