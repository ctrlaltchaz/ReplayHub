import { useApiQuery } from "@/lib/api/query";
import type { AttendanceEntry } from "@/types/attendance";

export function useMyAttendance(slug: string) {
  const path = `/org/${slug}/attendance/logger/me`;
  return useApiQuery<AttendanceEntry[]>(path, {
    apiOptions: { slug },
    staleTime: 1000 * 15,
  });
}
