import { useApiQuery } from "@/lib/api/query";

export interface ProductionSession {
  id: string;
  name: string;
  sessionDate: string;
  windowStart: string;
  windowEnd: string;
  isRecurring: boolean;
  status: string;
  eventId?: string | null;
  event?: {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
  } | null;
}

export function useProductionSessions(slug: string, params?: { from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);
  const qs = searchParams.toString();
  return useApiQuery<ProductionSession[]>(`/org/${slug}/attendance/sessions${qs ? `?${qs}` : ""}`, {
    apiOptions: { slug },
    staleTime: 1000 * 60,
  });
}
