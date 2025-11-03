"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Event } from "../../hooks/events";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface EventDeleteDialogProps {
    event: Event | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
}

export function EventDeleteDialog({ event, open, onOpenChange, onConfirm }: EventDeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!event) return;

        setIsDeleting(true);

        try {
            await onConfirm();

            onOpenChange(false);
        } catch (error) {
            // Error handling done by parent
            console.error('Failed to delete event:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <DialogTitle>Delete Event</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{event?.title}&quot;? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isDeleting ? 'Deleting...' : 'Delete Event'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
