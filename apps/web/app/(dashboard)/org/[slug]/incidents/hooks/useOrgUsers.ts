import { getApiUrl } from '@/lib/api/config';
import { useQuery } from '@tanstack/react-query';

interface OrgUser {
    id: string;
    displayName: string;
    email: string;
}

export function useOrgUsers(orgSlug: string) {
    return useQuery({
        queryKey: ['org-users', orgSlug],
        queryFn: async (): Promise<OrgUser[]> => {
            const url = getApiUrl(`/org/${orgSlug}/users?limit=100`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch users');
            }

            const data = await response.json();
            return data.users || [];
        },
    });
}
