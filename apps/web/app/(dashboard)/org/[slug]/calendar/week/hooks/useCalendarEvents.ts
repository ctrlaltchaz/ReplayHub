import type { Event } from "@/hooks/events";
import { useApiQuery } from "@/lib/api/query";
import { format } from "date-fns";

interface CalendarEventsParams {
    startDate: Date;
    days?: number;
    eventType?: string;
    gameTitle?: string;
    productionLead?: string;
}

interface CalendarWeekResponse {
    events: Event[];
    meta: {
        timezone: string;
        period: {
            start: string;
            days: number;
            utcRange: {
                start: string;
                end: string;
            };
        };
    };
}

export function useCalendarEvents(slug: string, params: CalendarEventsParams) {
    const searchParams = new URLSearchParams();

    // Format start date as YYYY-MM-DD (backend expects 'start' parameter)
    searchParams.set('start', format(params.startDate, 'yyyy-MM-dd'));
    searchParams.set('days', String(params.days || 7));

    // Add optional filters
    if (params.eventType) {
        searchParams.set('eventType', params.eventType);
    }
    if (params.gameTitle) {
        searchParams.set('gameTitle', params.gameTitle);
    }
    if (params.productionLead) {
        searchParams.set('productionLead', params.productionLead);
    }

    const queryString = searchParams.toString();
    const path = `/org/${slug}/calendar/week?${queryString}`;

    const result = useApiQuery<CalendarWeekResponse>(path, {
        staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
        apiOptions: {
            credentials: 'include',
            slug: slug,
        },
    });

    // Transform the response to extract just the events array
    return {
        ...result,
        data: result.data?.events || [],
    };
}
