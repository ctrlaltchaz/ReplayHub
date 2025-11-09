import { getApiUrl } from '@/lib/api/config';
import type { InventoryItem, UpdateInventoryItemDto } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useUpdateInventoryItem(orgSlug: string, itemId: string) {
    return useMutation({
        mutationFn: async (dto: UpdateInventoryItemDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update inventory item');
            }

            return response.json() as Promise<InventoryItem>;
        },
    });
}
