'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Package, Plus, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAddItemsToKit } from '../../hooks/useAddItemsToKit';
import { useInventoryItems } from '../../hooks/useInventoryItems';
import { useInventoryKit } from '../../hooks/useInventoryKit';

export default function KitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const kitId = params?.kitId as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showAddItemsDialog, setShowAddItemsDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    const { data: kit, isLoading: kitLoading } = useInventoryKit(slug, kitId);
    const { data: itemsResponse, isLoading: itemsLoading } = useInventoryItems(slug, {
        q: searchQuery || undefined,
    });
    const addItemsToKit = useAddItemsToKit(slug, kitId);

    const availableItems = itemsResponse?.data || [];
    const kitItemIds = new Set(kit?.items?.map((ki) => ki.itemId) || []);
    const itemsNotInKit = availableItems.filter((item) => !kitItemIds.has(item.id));

    const handleAddItems = async () => {
        if (selectedItemIds.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please select at least one item to add',
                variant: 'destructive',
            });
            return;
        }

        try {
            await addItemsToKit.mutateAsync({ itemIds: selectedItemIds });
            toast({
                title: 'Success',
                description: `Added ${selectedItemIds.length} ${selectedItemIds.length === 1 ? 'item' : 'items'} to kit`,
            });
            queryClient.invalidateQueries({ queryKey: ['inventory-kit', slug, kitId] });
            setShowAddItemsDialog(false);
            setSelectedItemIds([]);
            setSearchQuery('');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to add items to kit',
                variant: 'destructive',
            });
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItemIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

    if (kitLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!kit) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Kit Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            The equipment kit you're looking for doesn't exist.
                        </p>
                        <Button onClick={() => router.push(`/org/${slug}/inventory/kits`)}>
                            Back to Kits
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push(`/org/${slug}/inventory/kits`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{kit.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {kit.items?.length || 0} {kit.items?.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowAddItemsDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Items
                    </Button>
                </div>

                {/* Kit Items */}
                {kit.items && kit.items.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {kit.items.map((kitItem) => {
                            const item = kitItem.item;
                            if (!item) return null;

                            return (
                                <Card
                                    key={kitItem.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/org/${slug}/inventory/${item.id}`)}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base truncate">{item.name}</CardTitle>
                                        <CardDescription className="font-mono text-xs">{item.tag}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {item.type}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {item.status}
                                            </Badge>
                                        </div>
                                        {item.location && (
                                            <p className="text-xs text-muted-foreground truncate">{item.location}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="w-16 h-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Items in Kit</h3>
                            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                                Add equipment items to this kit to start organizing your gear.
                            </p>
                            <Button onClick={() => setShowAddItemsDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Items
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Add Items Dialog */}
                <Dialog open={showAddItemsDialog} onOpenChange={setShowAddItemsDialog}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add Items to Kit</DialogTitle>
                            <DialogDescription>Select items to add to {kit.name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Items List */}
                            <div className="max-h-[400px] overflow-y-auto border rounded-md p-4 space-y-2">
                                {itemsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : itemsNotInKit.length > 0 ? (
                                    itemsNotInKit.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                                            onClick={() => toggleItemSelection(item.id)}
                                        >
                                            <Checkbox
                                                checked={selectedItemIds.includes(item.id)}
                                                onCheckedChange={() => toggleItemSelection(item.id)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.tag} • {item.type}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {item.status}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        {searchQuery
                                            ? 'No items found matching your search'
                                            : 'All items are already in this kit'}
                                    </div>
                                )}
                            </div>

                            {selectedItemIds.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {selectedItemIds.length} {selectedItemIds.length === 1 ? 'item' : 'items'}{' '}
                                    selected
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddItemsDialog(false);
                                    setSelectedItemIds([]);
                                    setSearchQuery('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAddItems} disabled={addItemsToKit.isPending || selectedItemIds.length === 0}>
                                {addItemsToKit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Add Selected
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
