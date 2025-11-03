import { getApiUrl } from '@/lib/api/config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateUserDto, OrgUser } from '../types/settings';

export function useCreateUser(orgSlug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateUserDto): Promise<OrgUser> => {
            const url = getApiUrl(`/org/${orgSlug}/users`);
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
                throw new Error(error.message || 'Failed to create user');
            }

            const result = await response.json();
            return result.orgUser;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', orgSlug] });
        },
    });
}
