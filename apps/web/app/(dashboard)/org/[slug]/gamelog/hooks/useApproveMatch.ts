import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useApproveMatch(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiPost(`/org/${slug}/gamelog/matches/${matchId}/approve`, {});
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches/${matchId}`],
            });
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches`],
            });
        },
    });
}
