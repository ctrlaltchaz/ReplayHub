"use client";

import { useApiMutation } from "@/lib/api/query";
import type { CreateAchievementDto } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateAchievement(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<any, CreateAchievementDto>(`/org/${slug}/achievements`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/achievements`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
        },
    });
}
