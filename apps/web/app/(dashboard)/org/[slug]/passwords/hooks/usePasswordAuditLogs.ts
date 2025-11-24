import { getApiUrl } from "@/lib/api/config";
import type { PasswordAuditEntry } from "@/types/passwords";
import { useQuery } from "@tanstack/react-query";

export function usePasswordAuditLogs(orgSlug: string, passwordId?: string, enabled = true) {
  return useQuery({
    queryKey: ["password-audit", orgSlug, passwordId],
    enabled: Boolean(passwordId) && enabled,
    queryFn: async (): Promise<PasswordAuditEntry[]> => {
      const response = await fetch(getApiUrl(`/org/${orgSlug}/passwords/${passwordId}/audit`), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const json = await response.json();
      return json.data || json;
    },
  });
}
