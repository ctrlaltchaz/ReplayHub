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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AssetStatus } from '@/types/asset';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { TagInput } from './TagInput';

interface BulkActionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: 'tags' | 'status' | null;
    selectedCount: number;
    onConfirm: (action: 'tags' | 'status', value: string[] | AssetStatus) => void;
    isProcessing: boolean;
    existingTags?: string[];
}

export function BulkActionsDialog({
    open,
    onOpenChange,
    action,
    selectedCount,
    onConfirm,
    isProcessing,
    existingTags = [],
}: BulkActionsDialogProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [status, setStatus] = useState<AssetStatus>('active');

    const handleApply = () => {
        if (action === 'tags') {
            onConfirm('tags', tags);
        } else if (action === 'status') {
            onConfirm('status', status);
        }
    };

    const getTitle = () => {
        switch (action) {
            case 'tags':
                return 'Bulk Edit Tags';
            case 'status':
                return 'Bulk Change Status';
            default:
                return 'Bulk Actions';
        }
    };

    const getDescription = () => {
        switch (action) {
            case 'tags':
                return `Add tags to ${selectedCount} selected asset(s). These will be added to any existing tags.`;
            case 'status':
                return `Change the status of ${selectedCount} selected asset(s).`;
            default:
                return '';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogDescription>{getDescription()}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {action === 'tags' && (
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <TagInput
                                value={tags}
                                onChange={setTags}
                                suggestions={existingTags}
                                placeholder="Add tags to selected assets..."
                            />
                        </div>
                    )}

                    {action === 'status' && (
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={status} onValueChange={(value) => setStatus(value as AssetStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply} disabled={isProcessing || (action === 'tags' && tags.length === 0)}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            `Apply to ${selectedCount} Asset(s)`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
