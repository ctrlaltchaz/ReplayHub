import { useApiMutation } from "@/lib/api/query";
import type { CreateTeamDto, Team } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateTeam(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Team, CreateTeamDto>(`/org/${slug}/teams`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
        },
    });
}
