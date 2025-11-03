import { useApiQuery } from "@/lib/api/query";
import type { Team, TeamsQueryParams } from "@/types/roster";

export function useTeamsList(slug: string, params?: TeamsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params?.game) {
        searchParams.set('game', params.game);
    }
    if (params?.season) {
        searchParams.set('season', params.season);
    }
    if (params?.status) {
        searchParams.set('status', params.status);
    }
    if (params?.q) {
        searchParams.set('q', params.q);
    }

    const queryString = searchParams.toString();
    const path = `/org/${slug}/teams${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Team[]>(path, {
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}
