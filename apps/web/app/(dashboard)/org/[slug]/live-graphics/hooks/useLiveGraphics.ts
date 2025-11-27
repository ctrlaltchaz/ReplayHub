import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import type { LiveGraphic, UpdateLiveGraphicState } from "@/types/live-graphics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useLiveGraphics(slug: string) {
  return useQuery({
    queryKey: ["live-graphics", slug],
    queryFn: async () => apiGet<LiveGraphic[]>(`/org/${slug}/live-graphics`),
    enabled: !!slug,
  });
}

export function useLiveGraphic(slug: string, graphicId?: string) {
  return useQuery({
    queryKey: ["live-graphics", slug, graphicId],
    queryFn: async () => apiGet<LiveGraphic>(`/org/${slug}/live-graphics/${graphicId}`),
    enabled: !!slug && !!graphicId,
  });
}

export function useCreateLiveGraphic(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<LiveGraphic, ApiError, { name: string; description?: string }>({
    mutationFn: async (payload) => apiPost<LiveGraphic>(`/org/${slug}/live-graphics`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-graphics", slug] });
    },
  });
}

export function useUploadLiveGraphic(slug: string, graphicId?: string) {
  const queryClient = useQueryClient();

  return useMutation<LiveGraphic, ApiError, FormData>({
    mutationFn: async (formData: FormData) => {
      if (!graphicId) {
        throw new ApiError(400, "No graphic selected");
      }
      const response = await fetch(getApiUrl(`/org/${slug}/live-graphics/${graphicId}/upload`), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new ApiError(response.status, error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-graphics", slug] });
      if (graphicId) {
        queryClient.invalidateQueries({ queryKey: ["live-graphics", slug, graphicId] });
      }
    },
  });
}

export function useUpdateLiveGraphicState(slug: string, graphicId?: string) {
  const queryClient = useQueryClient();

  return useMutation<LiveGraphic, ApiError, UpdateLiveGraphicState>({
    mutationFn: async (payload: UpdateLiveGraphicState) => {
      if (!graphicId) {
        throw new ApiError(400, "No graphic selected");
      }
      return apiPatch<LiveGraphic>(`/org/${slug}/live-graphics/${graphicId}/state`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-graphics", slug] });
      if (graphicId) {
        queryClient.invalidateQueries({ queryKey: ["live-graphics", slug, graphicId] });
      }
    },
  });
}

type UpdateMetadataPayload = Partial<Pick<LiveGraphic, "name" | "description">> & { id?: string };

export function useUpdateLiveGraphic(slug: string, graphicId?: string) {
  const queryClient = useQueryClient();

  return useMutation<LiveGraphic, ApiError, UpdateMetadataPayload>({
    mutationFn: async ({ id, ...payload }) => {
      const targetId = id ?? graphicId;
      if (!targetId) {
        throw new ApiError(400, "No graphic selected");
      }
      return apiPatch<LiveGraphic>(`/org/${slug}/live-graphics/${targetId}`, payload);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["live-graphics", slug] });
      const targetId = id ?? graphicId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ["live-graphics", slug, targetId] });
      }
    },
  });
}

export function useDeleteLiveGraphic(slug: string) {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: async (graphicId: string) => {
      return apiDelete<{ success: boolean }>(`/org/${slug}/live-graphics/${graphicId}`);
    },
    onSuccess: (_data, graphicId) => {
      queryClient.invalidateQueries({ queryKey: ["live-graphics", slug] });
      if (graphicId) {
        queryClient.invalidateQueries({ queryKey: ["live-graphics", slug, graphicId] });
      }
    },
  });
}
