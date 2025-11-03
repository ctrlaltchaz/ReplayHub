import { useApiMutation } from "@/lib/api/query";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteMatch(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<void, void>(`/org/${slug}/gamelog/matches/${matchId}`, {
        method: 'DELETE',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/gamelog/matches`] });
        },
    });
}
