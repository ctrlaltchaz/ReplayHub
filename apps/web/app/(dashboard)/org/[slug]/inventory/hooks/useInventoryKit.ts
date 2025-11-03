import { getApiUrl } from '@/lib/api/config';
import type { InventoryKit } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export function useInventoryKit(orgSlug: string, kitId: string) {
    return useQuery({
        queryKey: ['inventory-kit', orgSlug, kitId],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/kits/${kitId}`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch inventory kit');

            const result = await response.json();
            return result as InventoryKit;
        },
        enabled: !!kitId,
    });
}
