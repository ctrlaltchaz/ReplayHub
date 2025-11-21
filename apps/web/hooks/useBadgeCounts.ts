import { useApiQuery } from "@/lib/api/query";

interface BadgeCounts {
  incidents: number;
  events: number;
  checklists: number;
  tasks: number;
}

/**
 * Hook to fetch live badge counts for sidebar navigation
 */
export function useBadgeCounts(orgSlug?: string, enabled: boolean = true) {
  const { data, isLoading } = useApiQuery<BadgeCounts>(
    orgSlug ? `/org/${orgSlug}/dashboard/counts` : "",
    {
      enabled: !!orgSlug && enabled,
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    }
  );

  return {
    counts: data || { incidents: 0, events: 0, checklists: 0, tasks: 0 },
    isLoading,
  };
}
