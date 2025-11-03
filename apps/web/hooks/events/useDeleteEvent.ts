import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../../lib/api/query';

export function useDeleteEvent(slug: string, eventId: string) {
    const queryClient = useQueryClient();

    return useApiMutation<void, void>(`/org/${slug}/events/${eventId}`, {
        method: 'DELETE',
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
        onSuccess: () => {
            // Invalidate events list
            queryClient.invalidateQueries({
                queryKey: [`/org/${slug}/events`],
                exact: false
            });
        },
    });
}
