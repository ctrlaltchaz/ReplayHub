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

interface DeleteRunsheetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runsheetTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function DeleteRunsheetDialog({
    open,
    onOpenChange,
    runsheetTitle,
    onConfirm,
    isLoading = false,
}: DeleteRunsheetDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Runsheet
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this runsheet?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <p className="text-sm">
                        <strong>{runsheetTitle}</strong> and all of its items will be permanently deleted.
                    </p>
                    <p className="text-sm text-destructive font-semibold">
                        ⚠️ This action cannot be undone.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete Runsheet"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
