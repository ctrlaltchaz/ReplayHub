import { apiDelete } from "@/lib/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteMapGame(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (mapGameId: string) => {
            return apiDelete(`/org/${slug}/gamelog/maps/${mapGameId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/gamelog/matches`],
            });
        },
    });
}
