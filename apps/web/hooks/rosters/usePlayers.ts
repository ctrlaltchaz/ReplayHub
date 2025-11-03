import { useApiMutation, useApiQuery } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';
import type { CreatePlayerDto, Player, PlayersQueryParams, UpdatePlayerDto } from './types';

// Players List Hook
export function usePlayers(slug: string, params: PlayersQueryParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const path = `/org/${slug}/players${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Player[]>(path, {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Single Player Hook
export function usePlayer(slug: string, playerId: string) {
    const path = `/org/${slug}/players/${playerId}`;

    return useApiQuery<Player>(path, {
        enabled: !!playerId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Create Player Hook
export function useCreatePlayer(slug: string) {
    const queryClient = useQueryClient();
    const playersQueryKey = [`/org/${slug}/players`, slug];

    return useApiMutation<Player, CreatePlayerDto>(`/org/${slug}/players`, {
        method: 'POST',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playersQueryKey });
        },
    });
}

// Update Player Hook
export function useUpdatePlayer(slug: string, playerId: string) {
    const queryClient = useQueryClient();
    const playerQueryKey = [`/org/${slug}/players/${playerId}`, slug];
    const playersQueryKey = [`/org/${slug}/players`, slug];

    return useApiMutation<Player, UpdatePlayerDto>(`/org/${slug}/players/${playerId}`, {
        method: 'PUT',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: playerQueryKey });
            queryClient.invalidateQueries({ queryKey: playersQueryKey });
        },
    });
}