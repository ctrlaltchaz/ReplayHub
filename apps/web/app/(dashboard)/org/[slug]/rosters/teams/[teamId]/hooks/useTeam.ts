import { useApiQuery } from '@/lib/api/query';
import type { Team } from '@/types/roster';

export function useTeam(slug: string, teamId: string) {
    return useApiQuery<Team>(`/org/${slug}/teams/${teamId}`, {
        enabled: !!slug && !!teamId,
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}
