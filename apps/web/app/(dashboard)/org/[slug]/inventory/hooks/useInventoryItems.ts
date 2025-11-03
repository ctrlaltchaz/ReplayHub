import { getApiUrl } from '@/lib/api/config';
import type { PaginatedInventoryItemsResponse, QueryInventoryItemsDto } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export function useInventoryItems(orgSlug: string, query?: QueryInventoryItemsDto) {
    return useQuery({
        queryKey: ['inventory-items', orgSlug, query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query?.q) params.append('q', query.q);
            if (query?.type) params.append('type', query.type);
            if (query?.status) params.append('status', query.status);
            if (query?.limit) params.append('limit', query.limit.toString());
            if (query?.cursor) params.append('cursor', query.cursor);

            const url = getApiUrl(`/org/${orgSlug}/inventory/items${params.toString() ? `?${params.toString()}` : ''}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch inventory items');

            const result = await response.json();
            return result as PaginatedInventoryItemsResponse;
        },
    });
}
