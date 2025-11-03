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
import { RotateCcw } from "lucide-react";

interface UnapproveRunsheetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runsheetTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function UnapproveRunsheetDialog({
    open,
    onOpenChange,
    runsheetTitle,
    onConfirm,
    isLoading = false,
}: UnapproveRunsheetDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-orange-600" />
                        Unapprove Runsheet
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to unapprove this runsheet?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm">
                        <strong>{runsheetTitle}</strong> will be returned to draft status and can be edited again.
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
                    <Button variant="default" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Unapproving..." : "Unapprove Runsheet"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
