"use client";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface DisplayBoard {
    id: string;
    name: string;
    description?: string;
    publicCode: string;
    publicUrl: string;
    interval: number;
    transition: string;
    status: string;
    imageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface DisplayBoardImage {
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    order: number;
    uploadedAt: string;
}

export interface DisplayBoardWithImages extends DisplayBoard {
    images: DisplayBoardImage[];
}

export interface CreateDisplayBoardDto {
    name: string;
    description?: string;
    interval?: number;
}

export interface UpdateDisplayBoardDto {
    name?: string;
    description?: string;
    interval?: number;
    status?: string;
}

export function useDisplayBoards(slug: string) {
    return useQuery({
        queryKey: ["display-boards", slug],
        queryFn: async () => apiGet<DisplayBoard[]>(`/org/${slug}/display-boards`),
        enabled: !!slug,
    });
}

export function useDisplayBoard(slug: string, id: string) {
    return useQuery({
        queryKey: ["display-board", slug, id],
        queryFn: async () => apiGet<DisplayBoardWithImages>(`/org/${slug}/display-boards/${id}`),
        enabled: !!id,
    });
}

export function useCreateDisplayBoard(slug: string) {
    const queryClient = useQueryClient();

    return useMutation<DisplayBoard, ApiError, CreateDisplayBoardDto>({
        mutationFn: async (data) => apiPost<DisplayBoard>(`/org/${slug}/display-boards`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["display-boards", slug] });
        },
    });
}

export function useUpdateDisplayBoard(slug: string) {
    const queryClient = useQueryClient();

    return useMutation<DisplayBoard, ApiError, UpdateDisplayBoardDto & { id: string }>({
        mutationFn: async ({ id, ...data }) => {
            return apiPatch<DisplayBoard>(`/org/${slug}/display-boards/${id}`, data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["display-boards", slug] });
            queryClient.invalidateQueries({
                queryKey: ["display-board", slug, variables.id],
            });
        },
    });
}

export function useDeleteDisplayBoard(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiDelete(`/org/${slug}/display-boards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["display-boards", slug] });
        },
    });
}

export function useUploadImage(slug: string, boardId: string) {
    const queryClient = useQueryClient();

    return useMutation<DisplayBoardImage, ApiError, File>({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const url = getApiUrl(`/org/${slug}/display-boards/${boardId}/images`);
            console.log("[DEBUG] Upload URL:", url);
            console.log("[DEBUG] File:", file.name, file.type, file.size);

            try {
                const response = await fetch(url, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });

                console.log("[DEBUG] Response status:", response.status);

                if (!response.ok) {
                    const error = await response.json().catch(() => ({ message: "Upload failed" }));
                    throw new ApiError(response.status, error.message || "Upload failed");
                }

                return response.json();
            } catch (error) {
                console.error("[DEBUG] Upload error:", error);
                // Network error or other fetch error
                if (error instanceof ApiError) {
                    throw error;
                }
                throw new ApiError(500, error instanceof Error ? error.message : "Network error - is the API server running?");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["display-board", slug, boardId],
            });
            queryClient.invalidateQueries({ queryKey: ["display-boards", slug] });
        },
    });
}

export function useDeleteImage(slug: string, boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (imageId: string) => {
            await apiDelete(
                `/org/${slug}/display-boards/${boardId}/images/${imageId}`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["display-board", slug, boardId],
            });
            queryClient.invalidateQueries({ queryKey: ["display-boards", slug] });
        },
    });
}

export function useReorderImages(slug: string, boardId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (imageIds: string[]) => {
            await apiPatch(
                `/org/${slug}/display-boards/${boardId}/images/reorder`,
                { imageIds }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["display-board", slug, boardId],
            });
        },
    });
}
