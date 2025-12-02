import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CrewTemplateMember {
  id?: string;
  orgUserId: string;
  role: string;
  notes?: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface CrewTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: CrewTemplateMember[];
}

export interface CreateCrewTemplateData {
  name: string;
  description?: string;
  isDefault?: boolean;
  members: Omit<CrewTemplateMember, "id" | "user">[];
}

export interface UpdateCrewTemplateData {
  name?: string;
  description?: string;
  isDefault?: boolean;
  members?: Omit<CrewTemplateMember, "id" | "user">[];
}

// Get all crew templates
export function useCrewTemplates(slug: string) {
  return useQuery<CrewTemplate[]>({
    queryKey: ["crew-templates", slug],
    queryFn: () => apiGet(`/org/${slug}/crew-templates`),
    enabled: !!slug,
  });
}

// Get single crew template
export function useCrewTemplate(slug: string, templateId: string | undefined) {
  return useQuery<CrewTemplate>({
    queryKey: ["crew-template", slug, templateId],
    queryFn: () => apiGet(`/org/${slug}/crew-templates/${templateId}`),
    enabled: !!slug && !!templateId,
  });
}

// Create crew template
export function useCreateCrewTemplate(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCrewTemplateData) => apiPost(`/org/${slug}/crew-templates`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
    },
  });
}

// Update crew template
export function useUpdateCrewTemplate(slug: string, templateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCrewTemplateData) =>
      apiPut(`/org/${slug}/crew-templates/${templateId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
      queryClient.invalidateQueries({ queryKey: ["crew-template", slug, templateId] });
    },
  });
}

// Delete crew template
export function useDeleteCrewTemplate(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => apiDelete(`/org/${slug}/crew-templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-templates", slug] });
    },
  });
}

// Apply template to event
export function useApplyCrewTemplate(slug: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      apiPost(`/org/${slug}/crew-templates/apply-to-event/${eventId}`, { templateId }),
    onSuccess: () => {
      // Invalidate event details to show updated crew
      queryClient.invalidateQueries({ queryKey: ["event", slug, eventId] });
    },
  });
}
