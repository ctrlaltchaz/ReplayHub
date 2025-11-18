import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../../lib/api/query';
import type { Event } from './types';

export interface UpdateEventData {
    title?: string;
    startAt?: string;
    endAt?: string;
    location?: string;
    teamId?: string;
    lineupId?: string;
    notes?: string;
    status?: 'scheduled' | 'cancelled' | 'completed';
}

export function useUpdateEvent(slug: string, eventId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Event, UpdateEventData>(`/org/${slug}/events/${eventId}`, {
        method: 'PUT',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            // Invalidate events list and specific event queries
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/events`],
                exact: false
            });
        },
    });
}
