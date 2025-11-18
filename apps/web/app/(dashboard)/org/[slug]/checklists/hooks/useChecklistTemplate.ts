import { useApiQuery } from '@/lib/api/query';
import type { ChecklistTemplate } from '@/types/checklist';

export function useChecklistTemplate(orgSlug: string, templateId?: string, options?: { enabled?: boolean }) {
    return useApiQuery<ChecklistTemplate>(
        templateId ? `/org/${orgSlug}/checklist-templates/${templateId}` : '',
        {
            enabled: Boolean(orgSlug && templateId && (options?.enabled ?? true)),
        }
    );
}
