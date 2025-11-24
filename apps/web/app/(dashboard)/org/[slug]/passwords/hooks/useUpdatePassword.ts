import { getApiUrl } from "@/lib/api/config";
import type { PasswordEntry, UpdatePasswordPayload } from "@/types/passwords";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePassword(orgSlug: string, passwordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload): Promise<PasswordEntry> => {
      const response = await fetch(getApiUrl(`/org/${orgSlug}/passwords/${passwordId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update password");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords", orgSlug] });
      queryClient.invalidateQueries({ queryKey: ["password", orgSlug, passwordId] });
    },
  });
}
