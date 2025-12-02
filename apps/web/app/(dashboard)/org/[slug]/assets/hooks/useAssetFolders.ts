import { getApiUrl } from '@/lib/api/config';
import type { PaginatedFoldersResponse, QueryFoldersDto } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';

export function useAssetFolders(orgSlug: string, query: QueryFoldersDto = {}) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.parentId !== undefined) params.set('parentId', query.parentId);
    if (query.limit) params.set('limit', query.limit.toString());
    if (query.cursor) params.set('cursor', query.cursor);

    const queryString = params.toString();

    return useQuery({
        queryKey: ['asset-folders', orgSlug, query],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/assets/folders${queryString ? `?${queryString}` : ''}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch folders');

            return response.json() as Promise<PaginatedFoldersResponse>;
        },
        staleTime: 30000, // 30 seconds
    });
}
