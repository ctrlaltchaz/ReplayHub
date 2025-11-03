import { useApiMutation } from "@/lib/api/query";
import type { Team, UpdateTeamDto } from "@/types/roster";
import { useQueryClient } from "@tanstack/react-query";

export function useUpdateTeam(slug: string, teamId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Team, UpdateTeamDto>(`/org/${slug}/teams/${teamId}`, {
        method: 'PUT',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
        },
    });
}
