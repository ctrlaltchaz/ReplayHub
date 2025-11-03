import { useApiMutation } from "@/lib/api/query";
import type { CreatePlayerDto, Player } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";

export function useCreatePlayer(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Player, CreatePlayerDto>(`/org/${slug}/players`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
        },
    });
}
