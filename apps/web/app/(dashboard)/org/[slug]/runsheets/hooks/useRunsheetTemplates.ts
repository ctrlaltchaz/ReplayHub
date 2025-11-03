import { apiGet } from "@/lib/api/client";
import type { RunsheetTemplate } from "@/types/runsheet-template-full";
import { useQuery } from "@tanstack/react-query";

export function useRunsheetTemplates(slug: string) {
    return useQuery({
        queryKey: ['runsheet-templates-full', slug],
        queryFn: () => apiGet<{ data: RunsheetTemplate[] }>(`/org/${slug}/runsheet-templates-full`),
        select: (data) => data.data,
    });
}
