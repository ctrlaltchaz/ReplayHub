import { getApiUrl } from '@/lib/api/config';
import { useQuery } from '@tanstack/react-query';

interface Event {
    id: string;
    title: string;
    startAt: string;
}

export function useEvents(orgSlug: string) {
    return useQuery({
        queryKey: ['events', orgSlug],
        queryFn: async (): Promise<Event[]> => {
            const url = getApiUrl(`/org/${orgSlug}/events?limit=100`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch events');
            }

            const data = await response.json();
            return data.events || [];
        },
    });
}
