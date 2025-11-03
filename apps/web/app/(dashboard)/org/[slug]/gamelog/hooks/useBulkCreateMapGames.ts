import { apiPost } from "@/lib/api/client";
import type { CreateMapGameDto } from "@/types/gamelog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useBulkCreateMapGames(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { maps: CreateMapGameDto[] }) => {
            return apiPost(`/org/${slug}/gamelog/matches/${matchId}/maps`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches/${matchId}`],
            });
        },
    });
}
