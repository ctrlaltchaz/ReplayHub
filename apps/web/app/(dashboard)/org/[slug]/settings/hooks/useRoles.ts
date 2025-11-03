import { getApiUrl } from '@/lib/api/config';
import { useQuery } from '@tanstack/react-query';
import type { Role } from '../types/settings';

export function useRoles(orgSlug: string) {
    return useQuery({
        queryKey: ['roles', orgSlug],
        queryFn: async (): Promise<Role[]> => {
            const url = getApiUrl(`/org/${orgSlug}/admin/roles`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch roles');
            }

            const data = await response.json();
            return data.roles;
        },
        enabled: !!orgSlug,
    });
}
