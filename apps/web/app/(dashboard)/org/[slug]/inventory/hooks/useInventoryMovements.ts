import { getApiUrl } from '@/lib/api/config';
import type { InventoryMovement } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export function useInventoryMovements(orgSlug: string, itemId: string) {
    return useQuery({
        queryKey: ['inventory-movements', orgSlug, itemId],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/movements?itemId=${itemId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch inventory movements');

            return response.json() as Promise<InventoryMovement[]>;
        },
        enabled: !!itemId,
    });
}
