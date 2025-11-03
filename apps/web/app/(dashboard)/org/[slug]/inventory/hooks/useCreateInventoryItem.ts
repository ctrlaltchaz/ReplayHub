import { getApiUrl } from '@/lib/api/config';
import type { CreateInventoryItemDto, InventoryItem } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useCreateInventoryItem(orgSlug: string) {
    return useMutation({
        mutationFn: async (dto: CreateInventoryItemDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dto),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create inventory item');
            }

            return response.json() as Promise<InventoryItem>;
        },
    });
}
