import { getApiUrl } from '@/lib/api/config';
import { useQuery } from '@tanstack/react-query';
import type { RoleWithPermissions } from '../types/settings';

export function useRoleDetails(orgSlug: string, roleId: string | null) {
    return useQuery({
        queryKey: ['role', orgSlug, roleId],
        queryFn: async (): Promise<RoleWithPermissions> => {
            const url = getApiUrl(`/org/${orgSlug}/admin/roles/${roleId}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch role details');
            }

            const data = await response.json();
            return data.role;
        },
        enabled: !!orgSlug && !!roleId,
    });
}
