import { getApiUrl } from "@/lib/api/config";
import { useQuery } from "@tanstack/react-query";
import type { OrgUser } from "../types/settings";

export function useUsers(orgSlug: string) {
  return useQuery({
    queryKey: ["users", orgSlug],
    queryFn: async (): Promise<OrgUser[]> => {
      const url = getApiUrl(`/org/${orgSlug}/users`);
      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch users");
      }

      const data = await response.json();
      return data.users || [];
    },
    enabled: !!orgSlug,
  });
}
