'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function DeleteItemDialog({ open, onOpenChange, itemTitle, onConfirm, isLoading }: DeleteItemDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            // Error handled by parent
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Runsheet Item
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{itemTitle}</strong>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
