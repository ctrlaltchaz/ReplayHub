import { useApiQuery } from '@/lib/api/query';

interface BadgeCounts {
    incidents: number;
    events: number;
    checklists: number;
}

/**
 * Hook to fetch live badge counts for sidebar navigation
 */
export function useBadgeCounts(orgSlug?: string) {
    const { data, isLoading } = useApiQuery<BadgeCounts>(
        orgSlug ? `/org/${orgSlug}/dashboard/counts` : '',
        {
            enabled: !!orgSlug,
            staleTime: 30 * 1000, // 30 seconds
            refetchInterval: 60 * 1000, // Refetch every minute
        }
    );

    return {
        counts: data || { incidents: 0, events: 0, checklists: 0 },
        isLoading,
    };
}
