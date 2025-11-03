import { getApiUrl } from '@/lib/api/config';
import type { AddItemsToKitDto } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useAddItemsToKit(orgSlug: string, kitId: string) {
    return useMutation({
        mutationFn: async (data: AddItemsToKitDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/kits/${kitId}/items`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add items to kit');
            }

            return response.json();
        },
    });
}
