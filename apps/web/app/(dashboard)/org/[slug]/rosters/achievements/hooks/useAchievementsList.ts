"use client";

import { useApiQuery } from "@/lib/api/query";
import type { Achievement } from "@/types/roster";

interface AchievementsQueryParams {
    teamId?: string;
    playerId?: string;
    from?: string;
    to?: string;
}

export function useAchievementsList(slug: string, params?: AchievementsQueryParams) {
    const searchParams = new URLSearchParams();

    if (params?.teamId) {
        searchParams.set('teamId', params.teamId);
    }
    if (params?.playerId) {
        searchParams.set('playerId', params.playerId);
    }
    if (params?.from) {
        searchParams.set('from', params.from);
    }
    if (params?.to) {
        searchParams.set('to', params.to);
    }

    const queryString = searchParams.toString();
    const path = `/org/${slug}/achievements${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Achievement[]>(path, {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}
