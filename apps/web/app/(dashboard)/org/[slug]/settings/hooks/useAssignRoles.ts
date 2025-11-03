import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AssignRolesDto, OrgUser } from '../types/settings';

export function useAssignRoles(orgSlug: string, userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AssignRolesDto): Promise<OrgUser> => {
            const url = getApiUrl(`/org/${orgSlug}/admin/users/${userId}/roles`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to assign roles');
            }

            const result = await response.json();
            return result.orgUser;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
            queryClient.invalidateQueries({ queryKey: ['roles', orgSlug] });
        },
    });
}
