import { apiGet } from '@/lib/api/client';
import type { Runsheet } from '@/types/runsheet';
import { useQuery } from '@tanstack/react-query';

export function useRunsheet(slug: string, runsheetId: string | undefined) {
    return useQuery({
        queryKey: ['runsheet', slug, runsheetId],
        queryFn: async () => {
            if (!runsheetId) throw new Error('Runsheet ID is required');
            return apiGet<Runsheet>(`/org/${slug}/runsheets/${runsheetId}`);
        },
        enabled: !!slug && !!runsheetId,
    });
}
