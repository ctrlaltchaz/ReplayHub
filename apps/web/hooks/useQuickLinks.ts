import { apiGet } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

export interface QuickLink {
    label: string;
    url: string;
    icon?: string;
    openInNewTab: boolean;
}

export function useQuickLinks(slug: string | undefined) {
    return useQuery<QuickLink[]>({
        queryKey: ['quickLinks', slug],
        queryFn: async () => {
            if (!slug) return [];
            const data = await apiGet<{ quickLinks: QuickLink[] }>(`/org/${slug}/profile/quick-links`);
            return data.quickLinks || [];
        },
        enabled: !!slug,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}
