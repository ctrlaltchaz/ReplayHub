import { useApiQuery } from '../../lib/api/query';
import type { Event, EventsQueryParams } from './types';

export function useEventsList(slug: string, params: EventsQueryParams = {}) {
    const searchParams = new URLSearchParams();

    // Add non-empty params to search string
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    const path = `/org/${slug}/events${queryString ? `?${queryString}` : ''}`;

    return useApiQuery<Event[]>(path, {
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });
}