import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePlayerStat(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (statId: string) => {
            return apiDelete(`/org/${slug}/gamelog/stats/${statId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches`],
            });
        },
    });
}
