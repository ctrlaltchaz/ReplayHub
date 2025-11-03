import { useApiQuery } from '../../lib/api/query';
import type { Event } from './types';

export function useEvent(slug: string, eventId: string) {
    return useApiQuery<Event>(`/org/${slug}/events/${eventId}`, {
        enabled: !!eventId, // Only fetch if eventId is provided
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}