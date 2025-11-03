"use client";

import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnlinkPlayer(slug: string, playerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiDelete(
                `/org/${slug}/players/${playerId}/link-user`,
                {
                    slug,
                    credentials: 'include',
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/players/${playerId}`]
            });
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/players`]
            });
        },
    });
}
