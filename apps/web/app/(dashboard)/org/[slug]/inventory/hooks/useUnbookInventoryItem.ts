import { getApiUrl } from '@/lib/api/config';
import { useMutation } from '@tanstack/react-query';

export function useUnbookInventoryItem(orgSlug: string, itemId: string) {
    return useMutation({
        mutationFn: async () => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/items/${itemId}/unbook`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to unbook inventory item');
            }

            return response.json();
        },
    });
}
