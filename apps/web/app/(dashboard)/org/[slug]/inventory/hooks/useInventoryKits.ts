import { getApiUrl } from '@/lib/api/config';
import type { InventoryKit } from '@/types/inventory';
import { useQuery } from '@tanstack/react-query';

export function useInventoryKits(orgSlug: string) {
    return useQuery({
        queryKey: ['inventory-kits', orgSlug],
        queryFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/kits`);
            const response = await fetch(url, { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch inventory kits');

            const result = await response.json();
            return result as InventoryKit[];
        },
    });
}
