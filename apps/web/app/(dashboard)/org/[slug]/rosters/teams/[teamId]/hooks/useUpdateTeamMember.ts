import { apiPut } from '@/lib/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateTeamMemberDto {
    playerId: string;
    isStarter?: boolean;
    position?: string;
}

export function useUpdateTeamMember(slug: string, teamId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateTeamMemberDto) => {
            const { playerId, ...updateData } = data;
            return apiPut(`/org/${slug}/teams/${teamId}/members/${playerId}`, updateData, {
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
