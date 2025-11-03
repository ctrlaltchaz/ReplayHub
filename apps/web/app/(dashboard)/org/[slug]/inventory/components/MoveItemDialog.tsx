'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import type { InventoryItem, MoveInventoryItemDto } from '@/types/inventory';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMoveInventoryItem } from '../hooks/useMoveInventoryItem';

interface MoveItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    item: InventoryItem | null;
    onSuccess?: () => void;
}

export function MoveItemDialog({ open, onOpenChange, orgSlug, item, onSuccess }: MoveItemDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<MoveInventoryItemDto>({
        toLoc: '',
        note: '',
    });

    const moveItem = useMoveInventoryItem(orgSlug, item?.id || '');

    // Reset form when dialog opens with new item
    useEffect(() => {
        if (open && item) {
            setFormData({
                toLoc: '',
                note: '',
            });
        }
    }, [open, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.toLoc.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Destination location is required',
                variant: 'destructive',
            });
            return;
        }

        try {
            await moveItem.mutateAsync(formData);
            toast({
                title: 'Success',
                description: 'Item moved successfully',
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to move item',
                variant: 'destructive',
            });
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Move Item</DialogTitle>
                        <DialogDescription>
                            Update the location of <strong>{item.name}</strong> (Tag: {item.tag})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Current Location</Label>
                            <Input value={item.location || 'Not set'} disabled />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="toLoc">
                                New Location <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="toLoc"
                                placeholder="e.g., Storage Room A, Van #2, Arena Floor"
                                value={formData.toLoc}
                                onChange={(e) => setFormData({ ...formData, toLoc: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Notes (optional)</Label>
                            <Textarea
                                id="note"
                                placeholder="Reason for move, additional context..."
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={moveItem.isPending}>
                            {moveItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Move Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
