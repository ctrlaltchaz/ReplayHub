import { apiPost } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUnapproveMatch(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            return apiPost(`/org/${slug}/gamelog/matches/${matchId}/unapprove`, {});
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
