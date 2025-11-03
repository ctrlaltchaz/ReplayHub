'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { CreateInventoryItemDto, InventoryCondition, InventoryStatus } from '@/types/inventory';
import { useState } from 'react';
import { useCreateInventoryItem } from '../hooks/useCreateInventoryItem';

interface CreateItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    onSuccess?: () => void;
}

export function CreateItemDialog({ open, onOpenChange, orgSlug, onSuccess }: CreateItemDialogProps) {
    const { toast } = useToast();
    const createItem = useCreateInventoryItem(orgSlug);

    const [tag, setTag] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [serial, setSerial] = useState('');
    const [condition, setCondition] = useState<InventoryCondition>('good');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<InventoryStatus>('available');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const dto: CreateInventoryItemDto = {
                tag,
                name,
                type,
                serial: serial || undefined,
                condition,
                location: location || undefined,
                status,
                notes: notes || undefined,
            };

            await createItem.mutateAsync(dto);
            toast({
                title: 'Success',
                description: 'Inventory item created successfully',
            });

            // Reset form
            setTag('');
            setName('');
            setType('');
            setSerial('');
            setCondition('good');
            setLocation('');
            setStatus('available');
            setNotes('');

            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create inventory item',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>Create a new item in your inventory system</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tag">
                                Tag <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="tag"
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="e.g., CAM-001"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Unique identifier for this item</p>
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
                        <Button type="submit" disabled={createItem.isPending}>
                            {createItem.isPending ? 'Creating...' : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
