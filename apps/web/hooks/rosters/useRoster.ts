import { useApiMutation } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';
import type { AddTeamMemberDto, UpdateTeamMemberDto } from './types';

// Roster Management Hook
export function useRoster(slug: string, teamId: string) {
    const queryClient = useQueryClient();
    const teamQueryKey = [`/org/${slug}/teams/${teamId}`, slug];
    const teamsQueryKey = [`/org/${slug}/teams`, slug];

    const invalidateRosterQueries = () => {
        queryClient.invalidateQueries({ queryKey: teamQueryKey });
        queryClient.invalidateQueries({ queryKey: teamsQueryKey });
    };

    return {
        addMember: useApiMutation<any, AddTeamMemberDto>(`/org/${slug}/teams/${teamId}/members`, {
            method: 'POST',
            apiOptions: { slug, credentials: 'include' },
            onSuccess: invalidateRosterQueries,
        }),

        updateMember: (playerId: string) => useApiMutation<any, UpdateTeamMemberDto>(
            `/org/${slug}/teams/${teamId}/members/${playerId}`,
            {
                method: 'PUT',
                apiOptions: { slug, credentials: 'include' },
                onSuccess: invalidateRosterQueries,
            }
        ),

        removeMember: (playerId: string) => useApiMutation<any, void>(
            `/org/${slug}/teams/${teamId}/members/${playerId}`,
            {
                method: 'DELETE',
                apiOptions: { slug, credentials: 'include' },
                onSuccess: invalidateRosterQueries,
            }
        ),
    };
}

// Optimistic Update Hook for Roster Changes
export function useUpdateRoster(slug: string, teamId: string) {
    const queryClient = useQueryClient();
    const teamQueryKey = [`/org/${slug}/teams/${teamId}`, slug];

    return {
        updateMember: (playerId: string) => useApiMutation<any, UpdateTeamMemberDto>(
            `/org/${slug}/teams/${teamId}/members/${playerId}`,
            {
                method: 'PUT',
                apiOptions: { slug, credentials: 'include' },
                onMutate: async (updates) => {
                    // Cancel outgoing refetches
                    await queryClient.cancelQueries({ queryKey: teamQueryKey });

                    // Snapshot previous value
                    const previousTeam = queryClient.getQueryData(teamQueryKey);

                    // Optimistically update
                    queryClient.setQueryData(teamQueryKey, (old: any) => {
                        if (!old?.members) return old;
                        return {
                            ...old,
                            members: old.members.map((member: any) =>
                                member.playerId === playerId
                                    ? { ...member, ...updates }
                                    : member
                            ),
                        };
                    });

                    return { previousTeam };
                },
                onError: (err, variables, context: any) => {
                    // Rollback on error
                    if (context?.previousTeam) {
                        queryClient.setQueryData(teamQueryKey, context.previousTeam);
                    }
                },
                onSettled: () => {
                    // Always refetch after error or success
                    queryClient.invalidateQueries({ queryKey: teamQueryKey });
                },
            }
        ),
    };
}