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
import { Lock } from "lucide-react";

interface LockRunsheetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runsheetTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function LockRunsheetDialog({
    open,
    onOpenChange,
    runsheetTitle,
    onConfirm,
    isLoading = false,
}: LockRunsheetDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-blue-600" />
                        Lock Runsheet
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to lock this runsheet?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <p className="text-sm">
                        <span className="font-semibold">{runsheetTitle}</span> will be locked and no further changes can be made.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        ⚠️ This action cannot be undone. Once locked, the runsheet cannot be edited.
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
                    <Button variant="secondary" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Locking..." : "Lock Runsheet"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
