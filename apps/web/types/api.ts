export type Id = string;
export type Slug = string;
export type IsoDate = string;

export interface Paginated<T> {
    items: T[];
    nextCursor?: string;
    totalCount?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}