import { getApiUrl } from '@/lib/api/config';
import type { InventoryItem } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export function useInventoryItem(orgSlug: string, itemId: string) {
    return useQuery({
        queryKey: ['inventory-item', orgSlug, itemId],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch inventory item');

            return response.json() as Promise<InventoryItem>;
        },
        enabled: !!itemId,
    });
}
