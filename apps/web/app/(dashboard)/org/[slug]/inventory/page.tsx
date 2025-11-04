'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { PERMISSIONS } from '@/lib/permissions/utils';
import type { InventoryItem, InventoryStatus } from '@/types/inventory';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Plus, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookItemDialog } from './components/BookItemDialog';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CreateItemDialog } from './components/CreateItemDialog';
import { EditItemDialog } from './components/EditItemDialog';
import { ItemCard } from './components/ItemCard';
import { MoveItemDialog } from './components/MoveItemDialog';
import { useDeleteInventoryItem } from './hooks/useDeleteInventoryItem';
import { useInventoryItems } from './hooks/useInventoryItems';

export default function InventoryPage() {
    usePageTitle('Inventory');
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { hasPermission } = usePermissions();

    const canManageInventory = hasPermission(PERMISSIONS.INVENTORY_MANAGE);
    const canUpdateInventory = hasPermission(PERMISSIONS.INVENTORY_UPDATE);
    const canBookInventory = hasPermission(PERMISSIONS.INVENTORY_BOOK);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<InventoryStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [showBookDialog, setShowBookDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

    const { data: response, isLoading } = useInventoryItems(slug, {
        q: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
    });

    const items = response?.data || [];

    const deleteItem = useDeleteInventoryItem(slug);

    const handleEdit = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowEditDialog(true);
    };

    const handleMove = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowMoveDialog(true);
    };

    const handleBook = (item: InventoryItem) => {
        setSelectedItem(item);
        setShowBookDialog(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deleteItem.mutateAsync(itemToDelete.id);
            toast({
                title: 'Success',
                description: 'Inventory item deleted successfully',
            });
            queryClient.invalidateQueries({ queryKey: ['inventory-items', slug] });
            setItemToDelete(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete inventory item',
                variant: 'destructive',
            });
        }
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['inventory-items', slug] });
    };

    // Calculate stats
    const stats = items.length > 0
        ? {
            total: items.length,
            available: items.filter((i) => i.status === 'available').length,
            booked: items.filter((i) => i.status === 'booked').length,
            out: items.filter((i) => i.status === 'out').length,
            maintenance: items.filter((i) => i.status === 'maintenance').length,
        }
        : { total: 0, available: 0, booked: 0, out: 0, maintenance: 0 };

    // Get unique types for filter
    const uniqueTypes = items.length > 0 ? Array.from(new Set(items.map((i) => i.type))).sort() : [];

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            Inventory
                        </h1>
                        <p className="text-muted-foreground">Manage your equipment and assets</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/org/${slug}/inventory/kits`)}>
                            <Package className="w-4 h-4 mr-2" />
                            View Kits
                        </Button>
                        <PermissionGuard required={PERMISSIONS.INVENTORY_MANAGE}>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Item
                            </Button>
                        </PermissionGuard>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Total Items</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                            <p className="text-xs text-muted-foreground">Available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">{stats.booked}</div>
                            <p className="text-xs text-muted-foreground">Booked</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{stats.out}</div>
                            <p className="text-xs text-muted-foreground">Out</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
                            <p className="text-xs text-muted-foreground">Maintenance</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, tag, or serial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InventoryStatus | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                            <SelectItem value="out">Out</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {uniqueTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Items Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : items && items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onClick={() => router.push(`/org/${slug}/inventory/${item.id}`)}
                                onEdit={canUpdateInventory ? () => handleEdit(item) : undefined}
                                onMove={canUpdateInventory ? () => handleMove(item) : undefined}
                                onBook={canBookInventory ? () => handleBook(item) : undefined}
                                onDelete={canManageInventory ? () => setItemToDelete(item) : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'No items match your search criteria.'
                                    : 'Get started by adding your first inventory item.'}
                            </p>
                            <PermissionGuard required={PERMISSIONS.INVENTORY_MANAGE}>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Item
                                </Button>
                            </PermissionGuard>
                        </CardContent>
                    </Card>
                )}

                {/* Dialogs */}
                <CreateItemDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                    orgSlug={slug}
                    onSuccess={handleSuccess}
                />
                <EditItemDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    orgSlug={slug}
                    item={selectedItem}
                    onSuccess={handleSuccess}
                />
                <MoveItemDialog
                    open={showMoveDialog}
                    onOpenChange={setShowMoveDialog}
                    orgSlug={slug}
                    item={selectedItem}
                    onSuccess={handleSuccess}
                />
                <BookItemDialog
                    open={showBookDialog}
                    onOpenChange={setShowBookDialog}
                    orgSlug={slug}
                    item={selectedItem}
                    onSuccess={handleSuccess}
                />
                <ConfirmDialog
                    open={!!itemToDelete}
                    onOpenChange={(open) => !open && setItemToDelete(null)}
                    title="Delete Inventory Item"
                    description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    loading={deleteItem.isPending}
                />
            </div>
        </div>
    );
}
