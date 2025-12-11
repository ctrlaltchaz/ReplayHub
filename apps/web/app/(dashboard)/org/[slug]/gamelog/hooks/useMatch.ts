import { useApiQuery } from "@/lib/api/query";
import type { MatchWithDetails } from "@/types/gamelog";

export function useMatch(slug: string, matchId: string) {
    const path = `/org/${slug}/gamelog/matches/${matchId}`;

    const result = useApiQuery<MatchWithDetails>(path, {
        enabled: !!matchId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });

    // Debug logging
    if (result.data) {
        console.log('🎯 useMatch hook - Full match data:', result.data);
        console.log('🎯 useMatch hook - playerStatsByRound:', result.data.playerStatsByRound);
    }

    return result;
}
