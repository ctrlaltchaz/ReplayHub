import { apiDelete } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useRemoveTeamMember(slug: string, teamId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (playerId: string) => {
            return apiDelete(`/org/${slug}/teams/${teamId}/members/${playerId}`, {
                credentials: 'include',
                slug: slug,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams/${teamId}`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
        },
    });
}
