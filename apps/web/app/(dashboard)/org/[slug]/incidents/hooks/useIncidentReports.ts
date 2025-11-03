import { getApiUrl } from '@/lib/api/config';
import type { IncidentCategory, IncidentSeverity, IncidentStatus } from '@/types/incident';
import { useQuery } from '@tanstack/react-query';

export interface IncidentReportData {
    totalIncidents: number;
    byCategory: Record<IncidentCategory, number>;
    bySeverity: Record<IncidentSeverity, number>;
    byStatus: Record<IncidentStatus, number>;
    topTags: Array<{ tag: string; count: number }>;
    dateRange: {
        from: string;
        to: string;
    };
}

export interface ReportQueryParams {
    from?: string;
    to?: string;
    eventId?: string;
    category?: IncidentCategory;
    severity?: IncidentSeverity;
}

export function useIncidentReports(orgSlug: string, params?: ReportQueryParams) {
    return useQuery({
        queryKey: ['incident-reports', orgSlug, params],
        queryFn: async (): Promise<IncidentReportData> => {
            const queryParams = new URLSearchParams();

            if (params?.from) queryParams.append('from', params.from);
            if (params?.to) queryParams.append('to', params.to);
            if (params?.eventId) queryParams.append('eventId', params.eventId);
            if (params?.category) queryParams.append('category', params.category);
            if (params?.severity) queryParams.append('severity', params.severity);

            const url = getApiUrl(`/org/${orgSlug}/incidents/reports?${queryParams.toString()}`);
            const response = await fetch(url, {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch incident reports');
            }

            return response.json();
        },
    });
}
