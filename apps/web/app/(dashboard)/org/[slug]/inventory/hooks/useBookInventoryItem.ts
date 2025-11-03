import { getApiUrl } from '@/lib/api/config';
import type { BookInventoryItemDto } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useBookInventoryItem(orgSlug: string, itemId: string) {
    return useMutation({
        mutationFn: async (data: BookInventoryItemDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}/book`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to book inventory item');
            }

            return response.json();
        },
    });
}
