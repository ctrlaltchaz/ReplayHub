import { apiGet } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface Event {
    id: string;
    title: string;
    date: string;
    eventType: string;
}

export function useEventsList(slug: string) {
    return useQuery<Event[]>({
        queryKey: [`/org/${slug}/events`],
        queryFn: () => apiGet(`/org/${slug}/events`, { slug }),
        enabled: !!slug,
    });
}
