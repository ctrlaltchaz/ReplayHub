import { useApiQuery } from "@/lib/api/query";
import type { Player, PlayersQueryParams } from "@/types/roster";

export function usePlayersList(slug: string, params?: PlayersQueryParams) {
    const searchParams = new URLSearchParams();

    if (params?.q) {
        searchParams.set('q', params.q);
    }
    if (params?.active !== undefined) {
        searchParams.set('active', String(params.active));
    }
    if (params?.teamId) {
        searchParams.set('teamId', params.teamId);
    }
    if (params?.eligibility) {
        searchParams.set('eligibility', params.eligibility);
    }

    const queryString = searchParams.toString();
    const path = `/org/${slug}/players${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Player[]>(path, {
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}
