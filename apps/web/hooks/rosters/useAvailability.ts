import { useApiMutation, useApiQuery } from '@/lib/api/query';
import { useQueryClient } from '@tanstack/react-query';
import type { Availability, AvailabilityQueryParams, SetAvailabilityDto } from './types';

// Player Availability Hook
export function usePlayerAvailability(slug: string, playerId: string, date?: string) {
    const searchParams = new URLSearchParams();
    if (date) searchParams.set('date', date);

    const queryString = searchParams.toString();
    const path = `/org/${slug}/players/availability${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Availability[]>(path, {
        enabled: !!playerId,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Team Availability Hook
export function useTeamAvailability(slug: string, params: AvailabilityQueryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const path = `/org/${slug}/players/availability?${queryString}`;

    return useApiQuery<Availability[]>(path, {
        enabled: !!params.date,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        apiOptions: {
            slug,
            credentials: 'include',
        },
    });
}

// Set/Update Availability Hook
export function useUpsertAvailability(slug: string, playerId: string) {
    const queryClient = useQueryClient();
    const availabilityQueryKey = [`/org/${slug}/players/availability`, slug];
    const playerQueryKey = [`/org/${slug}/players/${playerId}`, slug];

    return useApiMutation<any, SetAvailabilityDto>(`/org/${slug}/players/${playerId}/availability`, {
        method: 'POST',
        apiOptions: { slug, credentials: 'include' },
        onSuccess: () => {
            // Invalidate availability and player queries
            queryClient.invalidateQueries({ queryKey: availabilityQueryKey });
            queryClient.invalidateQueries({ queryKey: playerQueryKey });
        },
    });
}