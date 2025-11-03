'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Edit2, Loader2, MapPin, Move, Package, Tag as TagIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BookItemDialog } from '../components/BookItemDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditItemDialog } from '../components/EditItemDialog';
import { MoveItemDialog } from '../components/MoveItemDialog';
import { MovementTimeline } from '../components/MovementTimeline';
import { useInventoryItem } from '../hooks/useInventoryItem';
import { useInventoryMovements } from '../hooks/useInventoryMovements';
import { useUnbookInventoryItem } from '../hooks/useUnbookInventoryItem';

const statusColors = {
    available: 'bg-green-100 text-green-800 border-green-200',
    booked: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    out: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
};

const conditionColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    repair: 'bg-orange-100 text-orange-800 border-orange-200',
    lost: 'bg-red-100 text-red-800 border-red-200',
};

export default function InventoryItemPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const itemId = params?.itemId as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [showBookDialog, setShowBookDialog] = useState(false);
    const [showUnbookDialog, setShowUnbookDialog] = useState(false);

    const { data: item, isLoading: itemLoading } = useInventoryItem(slug, itemId);
    const { data: movements, isLoading: movementsLoading } = useInventoryMovements(slug, itemId);
    const unbookItem = useUnbookInventoryItem(slug, itemId);

    const handleUnbook = async () => {
        try {
            await unbookItem.mutateAsync();
            toast({
                title: 'Success',
                description: 'Item unbooked successfully',
            });
            handleSuccess();
            setShowUnbookDialog(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to unbook item',
                variant: 'destructive',
            });
        }
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['inventory-item', slug, itemId] });
        queryClient.invalidateQueries({ queryKey: ['inventory-movements', slug, itemId] });
    };

    if (itemLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Item Not Found</h3>
                        <p className="text-sm text-muted-foreground mb-4">The inventory item you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push(`/org/${slug}/inventory`)}>Back to Inventory</Button>
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
                        <Button variant="ghost" onClick={() => router.push(`/org/${slug}/inventory`)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <TagIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground font-mono">{item.tag}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {item.status === 'available' && (
                            <Button variant="outline" onClick={() => setShowBookDialog(true)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Book for Event
                            </Button>
                        )}
                        {item.status === 'out' && (
                            <Button variant="outline" onClick={() => setShowUnbookDialog(true)}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Unbook/Return
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setShowMoveDialog(true)}>
                            <Move className="w-4 h-4 mr-2" />
                            Move Item
                        </Button>
                        <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Item Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Item Details</CardTitle>
                                <CardDescription>Complete information about this inventory item</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                        <Badge className={`capitalize ${statusColors[item.status]}`}>{item.status}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Condition</p>
                                        <Badge className={`capitalize ${conditionColors[item.condition]}`}>{item.condition}</Badge>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                                    <p className="text-sm">{item.type}</p>
                                </div>

                                {item.serial && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Serial Number</p>
                                        <p className="text-sm font-mono">{item.serial}</p>
                                    </div>
                                )}

                                {item.location && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Current Location</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-sm">{item.location}</p>
                                        </div>
                                    </div>
                                )}

                                {item.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
                                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                        <div>
                                            <p className="font-medium mb-1">Created</p>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Last Updated</p>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Movement History */}
                    <div>
                        {movementsLoading ? (
                            <Card>
                                <CardContent className="pt-6 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </CardContent>
                            </Card>
                        ) : (
                            <MovementTimeline movements={movements || []} />
                        )}
                    </div>
                </div>

                {/* Edit Dialog */}
                <EditItemDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    orgSlug={slug}
                    item={item}
                    onSuccess={handleSuccess}
                />

                {/* Move Dialog */}
                <MoveItemDialog
                    open={showMoveDialog}
                    onOpenChange={setShowMoveDialog}
                    orgSlug={slug}
                    item={item}
                    onSuccess={handleSuccess}
                />

                {/* Book Dialog */}
                <BookItemDialog
                    open={showBookDialog}
                    onOpenChange={setShowBookDialog}
                    orgSlug={slug}
                    item={item}
                    onSuccess={handleSuccess}
                />

                {/* Unbook Confirmation */}
                <ConfirmDialog
                    open={showUnbookDialog}
                    onOpenChange={setShowUnbookDialog}
                    title="Unbook Item"
                    description={`Are you sure you want to unbook "${item.name}"? This will return the item to available status.`}
                    onConfirm={handleUnbook}
                    loading={unbookItem.isPending}
                />
            </div>
        </div>
    );
}
