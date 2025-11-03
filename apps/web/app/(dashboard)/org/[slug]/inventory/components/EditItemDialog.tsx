'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { InventoryCondition, InventoryItem, InventoryStatus, UpdateInventoryItemDto } from '@/types/inventory';
import { useEffect, useState } from 'react';
import { useUpdateInventoryItem } from '../hooks/useUpdateInventoryItem';

interface EditItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    item: InventoryItem | null;
    onSuccess?: () => void;
}

export function EditItemDialog({ open, onOpenChange, orgSlug, item, onSuccess }: EditItemDialogProps) {
    const { toast } = useToast();
    const updateItem = useUpdateInventoryItem(orgSlug, item?.id || '');

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [serial, setSerial] = useState('');
    const [condition, setCondition] = useState<InventoryCondition>('good');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<InventoryStatus>('available');
    const [notes, setNotes] = useState('');

    // Populate form when item changes
    useEffect(() => {
        if (item) {
            setName(item.name);
            setType(item.type);
            setSerial(item.serial || '');
            setCondition(item.condition);
            setLocation(item.location || '');
            setStatus(item.status);
            setNotes(item.notes || '');
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!item) return;

        try {
            const dto: UpdateInventoryItemDto = {
                name,
                type,
                serial: serial || undefined,
                condition,
                location: location || undefined,
                status,
                notes: notes || undefined,
            };

            await updateItem.mutateAsync(dto);
            toast({
                title: 'Success',
                description: 'Inventory item updated successfully',
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update inventory item',
                variant: 'destructive',
            });
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogDescription>Update the details of this inventory item</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tag">Tag</Label>
                            <Input id="tag" value={item.tag} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Tag cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Sony Camera"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">
                                Type <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                placeholder="e.g., Camera"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serial">Serial Number</Label>
                            <Input
                                id="serial"
                                value={serial}
                                onChange={(e) => setSerial(e.target.value)}
                                placeholder="e.g., SN123456789"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="condition">Condition</Label>
                            <Select value={condition} onValueChange={(value) => setCondition(value as InventoryCondition)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="good">Good</SelectItem>
                                    <SelectItem value="repair">Needs Repair</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as InventoryStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                    <SelectItem value="out">Out</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Storage Room A, Shelf 3"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional information about this item..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateItem.isPending}>
                            {updateItem.isPending ? 'Updating...' : 'Update Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
