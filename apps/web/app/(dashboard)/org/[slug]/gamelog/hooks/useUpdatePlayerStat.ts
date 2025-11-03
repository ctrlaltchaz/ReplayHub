import { apiPut } from "@/lib/api/client";
import type { UpdatePlayerStatDto } from "@/types/gamelog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePlayerStat(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ statId, data }: { statId: string; data: UpdatePlayerStatDto }) => {
            return apiPut(`/org/${slug}/gamelog/stats/${statId}`, data);
        },
        onSuccess: () => {
            // Invalidate and refetch the match query
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches/${matchId}`],
            });
            queryClient.refetchQueries({
                queryKey: [`/org/${slug}/gamelog/matches/${matchId}`],
            });
        },
    });
}
