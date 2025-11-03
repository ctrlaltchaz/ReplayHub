import { useApiMutation, useApiQuery } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';
import type { Achievement, AchievementsQueryParams, CreateAchievementDto } from './types';

// Achievements List Hook
export function useAchievements(slug: string, params: AchievementsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const path = `/org/${slug}/achievements${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Achievement[]>(path, {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Team Achievements Hook
export function useTeamAchievements(slug: string, teamId: string, limit = 10) {
    const path = `/org/${slug}/achievements/teams/${teamId}?limit=${limit}`;

    return useApiQuery<Achievement[]>(path, {
        enabled: !!teamId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Player Achievements Hook
export function usePlayerAchievements(slug: string, playerId: string, limit = 10) {
    const path = `/org/${slug}/achievements/players/${playerId}?limit=${limit}`;

    return useApiQuery<Achievement[]>(path, {
        enabled: !!playerId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Create Achievement Hook
export function useCreateAchievement(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Achievement, CreateAchievementDto>(`/org/${slug}/achievements`, {
        method: 'POST',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/achievements`, slug] });

            // Invalidate team-specific achievements if teamId exists
            if (data.teamId) {
                queryClient.invalidateQueries({
                    queryKey: [`/org/${slug}/achievements/teams/${data.teamId}`, slug]
                });
                queryClient.invalidateQueries({
                    queryKey: [`/org/${slug}/teams/${data.teamId}`, slug]
                });
            }

            // Invalidate player-specific achievements if playerId exists
            if (data.playerId) {
                queryClient.invalidateQueries({
                    queryKey: [`/org/${slug}/achievements/players/${data.playerId}`, slug]
                });
                queryClient.invalidateQueries({
                    queryKey: [`/org/${slug}/players/${data.playerId}`, slug]
                });
            }
        },
    });
}

// Delete Achievement Hook
export function useDeleteAchievement(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<any, { achievementId: string; teamId?: string; playerId?: string }>(
        `/org/${slug}/achievements/:achievementId`,
        {
            method: 'DELETE',
            apiOptions: { slug, credentials: 'include' },
            onMutate: async ({ achievementId }) => {
                // Update the URL for the specific achievement
                return { achievementId };
            },
            onSuccess: (data, variables) => {
                // Invalidate relevant queries
                queryClient.invalidateQueries({ queryKey: [`/org/${slug}/achievements`, slug] });

                if (variables.teamId) {
                    queryClient.invalidateQueries({
                        queryKey: [`/org/${slug}/achievements/teams/${variables.teamId}`, slug]
                    });
                    queryClient.invalidateQueries({
                        queryKey: [`/org/${slug}/teams/${variables.teamId}`, slug]
                    });
                }

                if (variables.playerId) {
                    queryClient.invalidateQueries({
                        queryKey: [`/org/${slug}/achievements/players/${variables.playerId}`, slug]
                    });
                    queryClient.invalidateQueries({
                        queryKey: [`/org/${slug}/players/${variables.playerId}`, slug]
                    });
                }
            },
        }
    );
}