'use client';

import { getApiUrl } from '@/lib/api/config';
import type { DocCategory } from '@/types/docs';
import { useQuery } from '@tanstack/react-query';

export function useDocCategories(slug: string) {
    return useQuery<DocCategory[]>({
        queryKey: ['doc-categories', slug],
        queryFn: async () => {
            const response = await fetch(getApiUrl(`/org/${slug}/docs/categories`), {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch doc categories');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        },
    });
}
