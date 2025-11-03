import { getApiUrl } from '@/lib/api/config';
import type { PaginatedAssetsResponse, QueryAssetsDto } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';

export function useAssets(orgSlug: string, query: QueryAssetsDto = {}) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.status) params.set('status', query.status);
    if (query.tag) params.set('tag', query.tag);
    if (query.limit) params.set('limit', query.limit.toString());
    if (query.cursor) params.set('cursor', query.cursor);

    return useQuery({
        queryKey: ['assets', orgSlug, query],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/assets?${params.toString()}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch assets');

            return response.json() as Promise<PaginatedAssetsResponse>;
        },
    });
}
