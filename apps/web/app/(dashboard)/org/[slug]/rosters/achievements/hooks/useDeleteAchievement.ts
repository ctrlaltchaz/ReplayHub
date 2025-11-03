"use client";

import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAchievement(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (achievementId: string) => {
            return apiDelete(`/org/${slug}/achievements/${achievementId}`, {
                credentials: 'include',
                slug: slug,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/achievements`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
        },
    });
}
