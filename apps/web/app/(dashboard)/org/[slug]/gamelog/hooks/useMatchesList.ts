import { useApiQuery } from "@/lib/api/query";
import type { Match, MatchesQueryParams } from "@/types/gamelog";

export function useMatchesList(slug: string, params?: MatchesQueryParams) {
    const searchParams = new URLSearchParams();

    if (params?.teamId) {
        searchParams.set('teamId', params.teamId);
    }
    if (params?.tournament) {
        searchParams.set('tournament', params.tournament);
    }
    if (params?.status) {
        searchParams.set('status', params.status);
    }
    if (params?.result) {
        searchParams.set('result', params.result);
    }
    if (params?.from) {
        searchParams.set('from', params.from);
    }
    if (params?.to) {
        searchParams.set('to', params.to);
    }
    if (params?.page) {
        searchParams.set('page', String(params.page));
    }
    if (params?.limit) {
        searchParams.set('limit', String(params.limit));
    }

    const queryString = searchParams.toString();
    const path = `/org/${slug}/gamelog/matches${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<{ matches: Match[]; total: number; page: number; totalPages: number }>(
        path,
        {
            staleTime: 1000 * 60 * 2, // 2 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            apiOptions: {
                credentials: 'include',
                slug: slug,
            },
        }
    );
}
