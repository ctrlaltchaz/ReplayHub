import { useApiMutation, useApiQuery } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';
import type { CreateTeamDto, Team, TeamsQueryParams, UpdateTeamDto } from './types';

// Teams List Hook
export function useTeams(slug: string, params: TeamsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const path = `/org/${slug}/teams${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Team[]>(path, {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Single Team Hook
export function useTeam(slug: string, teamId: string) {
    const path = `/org/${slug}/teams/${teamId}`;

    return useApiQuery<Team>(path, {
        enabled: !!teamId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Create Team Hook
export function useCreateTeam(slug: string) {
    const queryClient = useQueryClient();
    const teamsQueryKey = [`/org/${slug}/teams`, slug];

    return useApiMutation<Team, CreateTeamDto>(`/org/${slug}/teams`, {
        method: 'POST',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            // Invalidate teams list
            queryClient.invalidateQueries({ queryKey: teamsQueryKey });
        },
    });
}

// Update Team Hook
export function useUpdateTeam(slug: string, teamId: string) {
    const queryClient = useQueryClient();
    const teamQueryKey = [`/org/${slug}/teams/${teamId}`, slug];
    const teamsQueryKey = [`/org/${slug}/teams`, slug];

    return useApiMutation<Team, UpdateTeamDto>(`/org/${slug}/teams/${teamId}`, {
        method: 'PUT',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            // Invalidate team and teams list
            queryClient.invalidateQueries({ queryKey: teamQueryKey });
            queryClient.invalidateQueries({ queryKey: teamsQueryKey });
        },
    });
}

// Archive Team Hook
export function useArchiveTeam(slug: string, teamId: string) {
    const queryClient = useQueryClient();
    const teamQueryKey = [`/org/${slug}/teams/${teamId}`, slug];
    const teamsQueryKey = [`/org/${slug}/teams`, slug];

    return useApiMutation<Team, void>(`/org/${slug}/teams/${teamId}/archive`, {
        method: 'POST',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: teamQueryKey });
            queryClient.invalidateQueries({ queryKey: teamsQueryKey });
        },
    });
}