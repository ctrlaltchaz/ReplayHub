import { fetchJson } from "@/lib/api/http";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteLineup(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lineupId: string) => {
            await fetchJson(
                `/org/${slug}/lineups/${lineupId}`,
                { method: 'DELETE' }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lineups', slug] });
        },
    });
}
