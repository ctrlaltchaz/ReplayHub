import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../../lib/api/query';
import type { CreateEventData, Event } from './types';

export function useCreateEvent(slug: string) {
    const queryClient = useQueryClient();

    return useApiMutation<Event, CreateEventData>(`/org/${slug}/events`, {
        method: 'POST',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            // Invalidate and refetch events list to show the new event
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/events`],
                exact: false
            });
        },
    });
}