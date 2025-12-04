import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CrewGroup {
    id: string;
    name: string;
    description: string;
    displayOrder: number;
    icon?: string;
}

export interface CreateCrewGroupData {
    name: string;
    description?: string;
    displayOrder: number;
    icon?: string;
}

export interface UpdateCrewGroupData {
    name: string;
    description?: string;
    displayOrder: number;
    icon?: string;
}

// Get all crew groups
export function useCrewGroups(slug: string) {
    return useQuery<CrewGroup[]>({
        queryKey: ["crew-groups", slug],
        queryFn: () => apiGet(`/org/${slug}/crew-groups`),
        enabled: !!slug,
    });
}

// Create crew group
export function useCreateCrewGroup(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCrewGroupData) => apiPost(`/org/${slug}/crew-groups`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crew-groups", slug] });
            queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
        },
    });
}

// Update crew group
export function useUpdateCrewGroup(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCrewGroupData }) =>
            apiPut(`/org/${slug}/crew-groups/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crew-groups", slug] });
            queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
        },
    });
}

// Delete crew group
export function useDeleteCrewGroup(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiDelete(`/org/${slug}/crew-groups/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["crew-groups", slug] });
            queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
        },
    });
}
