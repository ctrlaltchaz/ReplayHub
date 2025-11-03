'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NewChecklistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
}

export function NewChecklistDialog({ open, onOpenChange, orgSlug }: NewChecklistDialogProps) {
    const router = useRouter();

    const handleFromTemplate = () => {
        router.push(`/org/${orgSlug}/checklists/new?from=template`);
        onOpenChange(false);
    };

    const handleFromScratch = () => {
        router.push(`/org/${orgSlug}/checklists/new?from=scratch`);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Checklist</DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to create your checklist
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 space-y-2"
                        onClick={handleFromTemplate}
                    >
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5" />
                            <span className="font-semibold">From Template</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                            Start with a pre-built template and customize it
                        </p>
                    </Button>
                    <Button
                        variant="outline"
                        className="h-auto flex-col items-start p-4 space-y-2"
                        onClick={handleFromScratch}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            <span className="font-semibold">From Scratch</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                            Build a custom checklist from the ground up
                        </p>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
