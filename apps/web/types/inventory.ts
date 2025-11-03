// Inventory item status types
export type InventoryStatus = 'available' | 'booked' | 'out' | 'maintenance';
export type InventoryCondition = 'good' | 'repair' | 'lost';

// Inventory Item
export interface InventoryItem {
    id: string;
    tenantId: string;
    tag: string;
    name: string;
    type: string;
    serial?: string;
    condition: InventoryCondition;
    location?: string;
    status: InventoryStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    // Booking info (populated from latest movement when status is 'booked')
    bookedBy?: string;
    bookedByUserId?: string;
    bookedAt?: string;
    bookingEventId?: string;
    bookingDueBack?: string;
    bookingNote?: string;
}

// Inventory Kit
export interface InventoryKit {
    id: string;
    tenantId: string;
    name: string;
    createdAt: string;
    items?: InventoryKitItem[];
    _count?: {
        items: number;
    };
}

// Inventory Kit Item (junction table)
export interface InventoryKitItem {
    id: string;
    tenantId: string;
    kitId: string;
    itemId: string;
    item?: InventoryItem;
    kit?: InventoryKit;
}

// Inventory Movement
export interface InventoryMovement {
    id: string;
    tenantId: string;
    itemId: string;
    fromLoc?: string;
    toLoc?: string;
    byUserId?: string;
    at: string;
    note?: string;
    item?: InventoryItem;
    byUser?: {
        id: string;
        name?: string;
        email: string;
    };
}

// DTOs for API

export interface CreateInventoryItemDto {
    tag: string;
    name: string;
    type: string;
    serial?: string;
    condition?: InventoryCondition;
    location?: string;
    status?: InventoryStatus;
    notes?: string;
}

export interface UpdateInventoryItemDto {
    name?: string;
    type?: string;
    serial?: string;
    condition?: InventoryCondition;
    location?: string;
    status?: InventoryStatus;
    notes?: string;
}

export interface QueryInventoryItemsDto {
    q?: string; // search query
    type?: string;
    status?: InventoryStatus;
    limit?: number;
    cursor?: string;
}

export interface PaginatedInventoryItemsResponse {
    data: InventoryItem[];
    pagination: {
        hasNextPage: boolean;
        nextCursor: string | null;
    };
}

export interface CreateInventoryKitDto {
    name: string;
}

export interface AddItemsToKitDto {
    itemIds: string[];
}

export interface MoveInventoryItemDto {
    toLoc: string;
    note?: string;
}

export interface BookInventoryItemDto {
    eventId?: string;
    dueBack?: string;
    note?: string;
}

// Summary/Stats
export interface InventorySummary {
    total: number;
    available: number;
    booked: number;
    out: number;
    maintenance: number;
    byCondition: {
        good: number;
        repair: number;
        lost: number;
    };
}
