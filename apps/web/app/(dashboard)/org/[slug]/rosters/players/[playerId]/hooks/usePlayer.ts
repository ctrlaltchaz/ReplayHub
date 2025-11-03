"use client";

import { apiGet } from "@/lib/api/client";
import type { Player } from "@/types/roster";
import { useQuery } from "@tanstack/react-query";

export function usePlayer(slug: string, playerId: string) {
    return useQuery({
        queryKey: [`/org/${slug}/players/${playerId}`],
        queryFn: async () => {
            const data = await apiGet<Player>(
                `/org/${slug}/players/${playerId}`,
                {
                    slug,
                    credentials: 'include',
                }
            );
            return data;
        },
        enabled: !!slug && !!playerId,
    });
}
