import { getApiUrl } from "@/lib/api/config";
import type { PasswordEntry } from "@/types/passwords";
import { useQuery } from "@tanstack/react-query";

export function usePasswords(orgSlug: string, search?: string) {
  return useQuery({
    queryKey: ["passwords", orgSlug, search],
    queryFn: async (): Promise<PasswordEntry[]> => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const url = getApiUrl(
        `/org/${orgSlug}/passwords${params.toString() ? `?${params.toString()}` : ""}`
      );

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch passwords");
      }

      const json = await response.json();
      return json.data || json;
    },
  });
}
