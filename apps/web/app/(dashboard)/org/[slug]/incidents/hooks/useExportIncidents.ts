import { getApiUrl } from '@/lib/api/config';
import type { QueryIncidentsParams } from '@/types/incident';
import { useMutation } from '@tanstack/react-query';

export function useExportIncidents(orgSlug: string) {
    return useMutation({
        mutationFn: async (params?: QueryIncidentsParams): Promise<Blob> => {
            const queryParams = new URLSearchParams();

            if (params?.q) queryParams.append('q', params.q);
            if (params?.category) queryParams.append('category', params.category);
            if (params?.severity) queryParams.append('severity', params.severity);
            if (params?.status) queryParams.append('status', params.status);
            if (params?.from) queryParams.append('from', params.from);
            if (params?.to) queryParams.append('to', params.to);
            if (params?.eventId) queryParams.append('eventId', params.eventId);

            const url = getApiUrl(`/org/${orgSlug}/incidents/export?${queryParams.toString()}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to export incidents');
            }

            return response.blob();
        },
        onSuccess: (blob) => {
            // Create a download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `incidents-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    });
}
