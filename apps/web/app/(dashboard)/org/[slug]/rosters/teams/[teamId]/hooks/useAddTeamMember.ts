import { useApiMutation } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';

interface AddTeamMemberDto {
    playerId: string;
    isStarter?: boolean;
    position?: string;
}

export function useAddTeamMember(slug: string, teamId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<any, AddTeamMemberDto>(`/org/${slug}/teams/${teamId}/members`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams/${teamId}`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/teams`] });
        },
    });
}
