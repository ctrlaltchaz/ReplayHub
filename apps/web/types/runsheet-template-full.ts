export interface RunsheetTemplateItem {
    id: string;
    idx: number;
    title: string;
    type?: string;
    ownerId?: string;
    durationMs: number;
    location?: string;
    equipment?: string;
    priority?: string;
    notes?: string;
}

export interface RunsheetTemplate {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    items: RunsheetTemplateItem[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRunsheetTemplateDto {
    name: string;
    description?: string;
    runsheetId: string; // ID of the runsheet to save as template
}

export interface UpdateRunsheetTemplateDto {
    name: string;
    description?: string;
}

export interface RunsheetTemplatesListResponse {
    data: RunsheetTemplate[];
}
