// Asset status types
export type AssetStatus = 'active' | 'archived' | 'pending';

// Asset Folder
export interface AssetFolder {
    id: string;
    tenantId: string;
    name: string;
    parentId: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        children: number;
        assets: number;
    };
}

// Folder with contents (includes children and assets)
export interface AssetFolderWithContents extends AssetFolder {
    children: AssetFolder[];
    assets: Asset[];
}

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
    folderId?: string | null;
    folder?: AssetFolder;
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
    folderId?: string; // filter by folder ('root' for root level, folder ID for specific folder)
    limit?: number;
    cursor?: string;
}

export interface QueryFoldersDto {
    q?: string; // search by name
    parentId?: string; // filter by parent ('root' for root level)
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
    folderId?: string | null;
}

export interface CreateFolderDto {
    name: string;
    parentId?: string;
}

export interface UpdateFolderDto {
    name?: string;
    parentId?: string | null;
}

export interface PaginatedFoldersResponse {
    data: AssetFolder[];
    pagination: {
        hasNextPage: boolean;
        nextCursor: string | null;
    };
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
