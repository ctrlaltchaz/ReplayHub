import { getApiUrl } from '@/lib/api/config';
import type { CreateInventoryKitDto } from '@/types/inventory';
import { useMutation } from '@tanstack/react-query';

export function useCreateInventoryKit(orgSlug: string) {
    return useMutation({
        mutationFn: async (data: CreateInventoryKitDto) => {
            const url = getApiUrl(`/org/${orgSlug}/inventory/kits`);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create kit');
            }

            return response.json();
        },
    });
}
