import { useApiQuery } from "@/lib/api/query";
import type { MatchWithDetails } from "@/types/gamelog";

export function useMatch(slug: string, matchId: string) {
    const path = `/org/${slug}/gamelog/matches/${matchId}`;

    return useApiQuery<MatchWithDetails>(path, {
        enabled: !!matchId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}
