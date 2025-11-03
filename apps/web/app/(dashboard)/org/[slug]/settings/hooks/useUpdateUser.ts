import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrgUser, UpdateUserDto } from '../types/settings';

export function useUpdateUser(orgSlug: string, userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateUserDto): Promise<OrgUser> => {
            const url = getApiUrl(`/org/${orgSlug}/users/${userId}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update user');
            }

            const result = await response.json();
            return result.user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
        },
    });
}
