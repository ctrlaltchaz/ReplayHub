import { useApiMutation } from "@/lib/api/query";
import type { CreateMatchDto, Match } from "@/types/gamelog";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateMatch(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Match, CreateMatchDto>(`/org/${slug}/gamelog/matches`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/gamelog/matches`] });
        },
    });
}
