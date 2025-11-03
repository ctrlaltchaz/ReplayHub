import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrgUser } from '../types/settings';

export function useDeactivateUser(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string): Promise<OrgUser> => {
            const url = getApiUrl(`/org/${orgSlug}/users/${userId}/deactivate`);
            const response = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to deactivate user');
            }

            const result = await response.json();
            return result.user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
        },
    });
}

export function useReactivateUser(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string): Promise<OrgUser> => {
            const url = getApiUrl(`/org/${orgSlug}/users/${userId}/reactivate`);
            const response = await fetch(url, {
                method: 'PUT',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reactivate user');
            }

            const result = await response.json();
            return result.user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
        },
    });
}
