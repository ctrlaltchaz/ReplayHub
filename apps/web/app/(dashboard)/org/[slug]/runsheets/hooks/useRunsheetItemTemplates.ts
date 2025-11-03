"use client";

import { apiGet } from "@/lib/api/client";
import type { RunsheetTemplateItem } from "@/types/runsheet-template-full";
import { useQuery } from "@tanstack/react-query";

export function useRunsheetItemTemplates(slug: string, type?: string) {
    return useQuery({
        queryKey: type ? ['runsheet-templates', slug, type] : ['runsheet-templates', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            const queryString = params.toString();
            const url = `/org/${slug}/runsheet-templates${queryString ? `?${queryString}` : ''}`;
            return apiGet<RunsheetTemplateItem[]>(url, { slug });
        },
        enabled: !!slug,
    });
}
