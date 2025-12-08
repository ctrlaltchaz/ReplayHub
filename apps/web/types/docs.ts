export interface DocCategory {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    icon: string | null;
    order: number;
    organisationId: string | null;
    createdAt: string;
    updatedAt: string;
    _count?: {
        docs: number;
    };
}

export interface Doc {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    categoryId: string;
    organisationId: string | null;
    authorId: string | null;
    status: 'draft' | 'published' | 'archived';
    version: number;
    order: number;
    estimatedReadTime: number | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    category?: DocCategory;
    author?: {
        id: string;
        name: string | null;
        email: string;
    };
    _count?: {
        completions: number;
    };
}

export interface DocCompletion {
    id: string;
    docId: string;
    orgUserId: string;
    completedAt: string;
    notes: string | null;
    doc?: Doc;
}

export interface DocAttachment {
    id: string;
    docId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
}

export interface CreateDocDto {
    title: string;
    content: string;
    excerpt?: string;
    slug: string;
    category_id: string;
    status?: 'draft' | 'published' | 'archived';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    estimated_read_time?: number;
    is_featured?: boolean;
}

export interface UpdateDocDto {
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    category_id?: string;
    status?: 'draft' | 'published' | 'archived';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    estimated_read_time?: number;
    is_featured?: boolean;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    slug: string;
    icon?: string;
    sort_order?: number;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    slug?: string;
    icon?: string;
    sort_order?: number;
    is_active?: boolean;
}
