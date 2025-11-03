import { useApiMutation } from "@/lib/api/query";
import type { Player, UpdatePlayerDto } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";

export function useUpdatePlayer(slug: string, playerId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Player, UpdatePlayerDto>(`/org/${slug}/players/${playerId}`, {
        method: 'PUT',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
        },
    });
}
