// Asset status types
export type AssetStatus = 'active' | 'archived' | 'pending';

// Asset
export interface Asset {
    id: string;
    tenantId: string;
    path: string;
    name: string;
    mime: string;
    size: number;
    version: number;
    status: AssetStatus;
    tags?: string | string[]; // Can be string from DB or array from processed
    createdBy: {
        id: string;
        name?: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
    _count?: {
        versions: number;
    };
}

// Asset Version
export interface AssetVersion {
    id: string;
    tenantId: string;
    assetId: string;
    path: string;
    size: number;
    createdBy: {
        id: string;
        name?: string;
        email: string;
    };
    createdAt: string;
}

// DTOs for API

export interface QueryAssetsDto {
    q?: string; // search query
    status?: AssetStatus;
    tag?: string;
    limit?: number;
    cursor?: string;
}

export interface PaginatedAssetsResponse {
    data: Asset[];
    pagination: {
        hasNextPage: boolean;
        nextCursor: string | null;
    };
}

export interface UpdateAssetDto {
    name?: string;
    tags?: string | string[];
    status?: AssetStatus;
}

export interface AssetUploadResponse {
    id: string;
    path: string;
    name: string;
    mime: string;
    size: number;
    version: number;
    status: AssetStatus;
    createdAt: string;
}

// Summary/Stats
export interface AssetsSummary {
    total: number;
    active: number;
    archived: number;
    pending: number;
    totalSize: number;
    byType: {
        image: number;
        video: number;
        document: number;
        audio: number;
        other: number;
    };
}
