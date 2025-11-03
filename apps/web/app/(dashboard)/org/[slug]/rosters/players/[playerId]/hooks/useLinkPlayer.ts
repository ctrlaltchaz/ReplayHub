"use client";

import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LinkPlayerDto {
    userId: string;
}

export function useLinkPlayer(slug: string, playerId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: LinkPlayerDto) => {
            return apiPost(
                `/org/${slug}/players/${playerId}/link-user`,
                dto,
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
