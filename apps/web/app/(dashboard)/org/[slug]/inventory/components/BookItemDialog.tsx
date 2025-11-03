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
import type { BookInventoryItemDto, InventoryItem } from '@/types/inventory';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBookInventoryItem } from '../hooks/useBookInventoryItem';

interface BookItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    item: InventoryItem | null;
    onSuccess?: () => void;
}

export function BookItemDialog({ open, onOpenChange, orgSlug, item, onSuccess }: BookItemDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<BookInventoryItemDto>({
        eventId: '',
        dueBack: '',
        note: '',
    });

    const bookItem = useBookInventoryItem(orgSlug, item?.id || '');

    // Reset form when dialog opens with new item
    useEffect(() => {
        if (open && item) {
            setFormData({
                eventId: '',
                dueBack: '',
                note: '',
            });
        }
    }, [open, item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Convert dueBack to ISO 8601 if provided
            const submitData: BookInventoryItemDto = {
                eventId: formData.eventId || undefined,
                dueBack: formData.dueBack ? new Date(formData.dueBack).toISOString() : undefined,
                note: formData.note || undefined,
            };

            await bookItem.mutateAsync(submitData);
            toast({
                title: 'Success',
                description: 'Item booked successfully',
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to book item',
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
                        <DialogTitle>Book Item for Event</DialogTitle>
                        <DialogDescription>
                            Reserve <strong>{item.name}</strong> (Tag: {item.tag}) for an event
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventId">Event ID (optional)</Label>
                            <Input
                                id="eventId"
                                placeholder="Enter event ID to link booking"
                                value={formData.eventId}
                                onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Link this booking to a specific event
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueBack">Due Back Date (optional)</Label>
                            <Input
                                id="dueBack"
                                type="datetime-local"
                                value={formData.dueBack}
                                onChange={(e) => setFormData({ ...formData, dueBack: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                When should this item be returned?
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Notes (optional)</Label>
                            <Textarea
                                id="note"
                                placeholder="Purpose of booking, special instructions..."
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
                        <Button type="submit" disabled={bookItem.isPending}>
                            {bookItem.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Book Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
