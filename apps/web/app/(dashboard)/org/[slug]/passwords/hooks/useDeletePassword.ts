import { getApiUrl } from "@/lib/api/config";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePassword(orgSlug: string, passwordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(getApiUrl(`/org/${orgSlug}/passwords/${passwordId}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete password");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passwords", orgSlug] });
    },
  });
}
