import { useApiMutation } from "@/lib/api/query";
import type { Match, UpdateMatchDto } from "@/types/gamelog";
import { useQueryClient } from "@tanstack/react-query";

export function useUpdateMatch(slug: string, matchId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Match, UpdateMatchDto>(`/org/${slug}/gamelog/matches/${matchId}`, {
        method: 'PUT',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/gamelog/matches`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/gamelog/matches/${matchId}`] });
        },
    });
}
