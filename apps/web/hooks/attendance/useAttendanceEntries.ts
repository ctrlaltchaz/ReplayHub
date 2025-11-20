import { useMemo } from "react";
import { useApiQuery } from "@/lib/api/query";
import type { AttendanceEntry, AttendanceDepartment, AttendanceStatus } from "@/types/attendance";

export interface AttendanceFilters {
  sessionId?: string;
  scheduledDate?: string;
  status?: AttendanceStatus;
  department?: AttendanceDepartment;
  lateOnly?: boolean;
  autoClockOutOnly?: boolean;
  orgUserId?: string;
}

export function useAttendanceEntries(slug: string, filters: AttendanceFilters = {}) {
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (typeof value === "boolean") {
        if (!value) return;
        params.set(key, "true");
        return;
      }
      if (value === "") return;
      params.set(key, String(value));
    });
    return params.toString();
  }, [filters]);

  const path = filters.sessionId
    ? `/org/${slug}/attendance/sessions/${filters.sessionId}/entries${searchParams ? `?${searchParams}` : ""}`
    : `/org/${slug}/attendance/logger/wednesday${searchParams ? `?${searchParams}` : ""}`;

  return useApiQuery<AttendanceEntry[]>(path, {
    apiOptions: { slug },
    staleTime: 1000 * 30,
  });
}
