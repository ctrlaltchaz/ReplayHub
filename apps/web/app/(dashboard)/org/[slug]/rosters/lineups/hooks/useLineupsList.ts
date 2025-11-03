import { apiGet } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

interface Lineup {
    id: string;
    eventId: string;
    teamId: string;
    title?: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
    team: {
        id: string;
        name: string;
        game: string;
        season?: string;
    };
    _count: {
        slots: number;
    };
}

export function useLineupsList(slug: string) {
    return useQuery<Lineup[]>({
        queryKey: [`/org/${slug}/lineups`],
        queryFn: () => apiGet(`/org/${slug}/lineups`, {
            slug,
            credentials: 'include',
        }),
        enabled: !!slug,
    });
}
