import { getApiUrl } from "@/lib/api/config";
import type { CreatePasswordPayload, PasswordEntry } from "@/types/passwords";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePassword(orgSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePasswordPayload): Promise<PasswordEntry> => {
      const response = await fetch(getApiUrl(`/org/${orgSlug}/passwords`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create password");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords", orgSlug] });
    },
  });
}
