// Checklist Item Priority
export type ChecklistPriority = 'low' | 'medium' | 'high';

// Checklist Scope
export type ChecklistScope = 'event' | 'room' | 'kit' | 'general';

// Checklist Status
export type ChecklistStatus = 'pending' | 'in_progress' | 'done' | 'failed';

// Checklist Template Item
export interface ChecklistTemplateItem {
    text: string;
    required: boolean;
    evidence: boolean;
    category?: string;
    assignedTo?: string; // User ID for item-level ownership
    priority?: ChecklistPriority;
    estimatedMinutes?: number;
}

// Checklist Template
export interface ChecklistTemplate {
    id: string;
    tenantId: string;
    title: string;
    scope: ChecklistScope;
    version: number;
    itemsJson: ChecklistTemplateItem[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Completed Item Tracking
export interface ChecklistCompletedItem {
    idx: number; // Index of the item in the template
    completedAt: string;
    completedBy: string;
    notes?: string;
}

// Checklist Instance
export interface Checklist {
    id: string;
    tenantId: string;
    templateId?: string; // Optional - null for standalone checklists
    title?: string; // For standalone checklists
    scope?: ChecklistScope; // For standalone checklists
    itemsJson?: ChecklistTemplateItem[]; // For standalone checklists
    scopeRef?: string;
    dueAt?: string;
    assigneeId?: string;
    status: ChecklistStatus;
    completedItems: ChecklistCompletedItem[];
    createdAt: string;
    updatedAt: string;
    // Relations
    template?: ChecklistTemplate;
    assignee?: {
        id: string;
        name: string;
        email: string;
    };
}

// DTOs for API

export interface CreateChecklistTemplateDto {
    title: string;
    scope: ChecklistScope;
    itemsJson: ChecklistTemplateItem[];
}

export interface UpdateChecklistTemplateDto {
    title?: string;
    scope?: ChecklistScope;
    itemsJson?: ChecklistTemplateItem[];
}

export interface CreateChecklistDto {
    templateId?: string; // Optional - only needed when creating from template
    title?: string; // Required for standalone checklists
    scope?: ChecklistScope; // Required for standalone checklists
    itemsJson?: ChecklistTemplateItem[]; // Required for standalone checklists
    scopeRef?: string;
    dueAt?: string;
    assigneeId?: string;
}

export interface UpdateChecklistDto {
    title?: string;
    scope?: ChecklistScope;
    itemsJson?: ChecklistTemplateItem[];
    scopeRef?: string;
    dueAt?: string;
    assigneeId?: string;
    status?: ChecklistStatus;
    completedItems?: ChecklistCompletedItem[];
}

// Query DTOs

export interface ChecklistTemplateQueryDto {
    scope?: ChecklistScope;
    limit?: number;
    cursor?: string;
}

export interface ChecklistQueryDto {
    eventId?: string;
    templateId?: string;
    status?: ChecklistStatus;
    scopeRef?: string;
    assigneeId?: string;
    limit?: number;
    cursor?: string;
}

// API Response wrapper (if backend wraps in {data: []})
export interface ChecklistTemplatesResponse {
    data: ChecklistTemplate[];
}

export interface ChecklistsResponse {
    data: Checklist[];
}

export interface ChecklistTask {
    id: string;
    checklistId: string;
    templateId?: string | null;
    templateTitle?: string | null;
    checklistTitle?: string | null;
    checklistScope?: ChecklistScope;
    scopeRef?: string | null;
    title: string;
    category?: string | null;
    priority?: ChecklistPriority | null;
    required: boolean;
    evidence: boolean;
    estimatedMinutes?: number | null;
    dueAt?: string | null;
    checklistStatus: ChecklistStatus;
    checklistAssigneeId?: string | null;
    assignedOrgUserId?: string | null;
    completedAt?: string | null;
    completedBy?: string | null;
    itemIndex: number;
}

export interface ChecklistTaskQuery {
    status?: 'open' | 'completed';
    priority?: ChecklistPriority;
    dueBefore?: string;
    dueAfter?: string;
    search?: string;
    cursor?: string;
    limit?: number;
}

export interface ChecklistTaskResponse {
    data: ChecklistTask[];
    pagination: {
        hasMore: boolean;
        nextCursor: string | null;
    };
}
