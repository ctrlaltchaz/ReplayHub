import { apiPost } from "@/lib/api/client";
import type { CreatePlayerStatDto } from "@/types/gamelog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBulkCreatePlayerStats(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { stats: CreatePlayerStatDto[] }) => {
            return apiPost(`/org/${slug}/gamelog/matches/${matchId}/stats`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches/${matchId}`],
            });
        },
    });
}
