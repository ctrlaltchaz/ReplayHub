import { getApiUrl } from "@/lib/api/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssignRolesDto, OrgUser } from "../types/settings";

export function useAssignRoles(orgSlug: string, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignRolesDto): Promise<void> => {
      const url = getApiUrl(`/org/${orgSlug}/admin/users/${userId}/roles`);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        // API expects { roleIds: string[] }
        body: JSON.stringify({ roleIds: data.roles }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign roles");
      }
      // API response contains a message; role changes are observed via cache invalidation
      await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", orgSlug] });
      queryClient.invalidateQueries({ queryKey: ["roles", orgSlug] });
    },
  });
}
