import { getApiUrl } from "@/lib/api/config";
import type { PasswordDetail } from "@/types/passwords";
import { useQuery } from "@tanstack/react-query";

export function usePassword(orgSlug: string, passwordId?: string, enabled = true) {
  return useQuery({
    queryKey: ["password", orgSlug, passwordId],
    enabled: Boolean(passwordId) && enabled,
    queryFn: async (): Promise<PasswordDetail> => {
      const response = await fetch(getApiUrl(`/org/${orgSlug}/passwords/${passwordId}`), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch password");
      }

      return response.json();
    },
  });
}
