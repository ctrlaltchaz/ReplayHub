import { getApiUrl } from "@/lib/api/config";
import { useQuery } from "@tanstack/react-query";
import type { AuditLogFilters, AuditLogResponse } from "@/types/audit";

function buildQueryString(filters: AuditLogFilters, page: number, limit: number) {
  const params = new URLSearchParams();

  const merged: AuditLogFilters = {
    ...filters,
    page,
    limit,
  };

  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.append(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useAuditLogs(orgSlug: string, filters: AuditLogFilters, page: number, limit = 25) {
  return useQuery({
    queryKey: ["audit-logs", orgSlug, filters, page, limit],
    enabled: Boolean(orgSlug),
    queryFn: async (): Promise<AuditLogResponse> => {
      const qs = buildQueryString(filters, page, limit);
      const url = getApiUrl(`/org/${orgSlug}/audit-logs${qs}`);
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        let message = "Failed to fetch audit logs";
        try {
          const error = await res.json();
          message = error?.message ?? message;
        } catch {
          // ignore json parse errors
        }
        throw new Error(message);
      }

      return res.json();
    },
  });
}
