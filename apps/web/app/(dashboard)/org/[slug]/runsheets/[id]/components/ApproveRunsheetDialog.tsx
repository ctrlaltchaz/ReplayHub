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
import { CheckCircle } from "lucide-react";

interface ApproveRunsheetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runsheetTitle: string;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function ApproveRunsheetDialog({
    open,
    onOpenChange,
    runsheetTitle,
    onConfirm,
    isLoading = false,
}: ApproveRunsheetDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Approve Runsheet
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to approve this runsheet?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm">
                        <span className="font-semibold">{runsheetTitle}</span> will be marked as approved and the revision number will be incremented.
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
                    <Button onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? "Approving..." : "Approve Runsheet"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
