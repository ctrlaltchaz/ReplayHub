import { getApiUrl } from '@/lib/api/config';
import type { MoveInventoryItemDto } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useMoveInventoryItem(orgSlug: string, itemId: string) {
    return useMutation({
        mutationFn: async (data: MoveInventoryItemDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}/move`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to move inventory item');
            }

            return response.json();
        },
    });
}
