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
import { useAssetFolders } from '../hooks/useAssetFolders';
import { useParams } from 'next/navigation';

interface BulkActionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: 'tags' | 'status' | 'folder' | null;
    selectedCount: number;
    onConfirm: (action: 'tags' | 'status' | 'folder', value: string[] | AssetStatus | string | null) => void;
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
    const params = useParams();
    const slug = params.slug as string;
    const { data: foldersResponse } = useAssetFolders(slug);
    
    const [tags, setTags] = useState<string[]>([]);
    const [status, setStatus] = useState<AssetStatus>('active');
    const [folderId, setFolderId] = useState<string | null>(null);

    const handleApply = () => {
        if (action === 'tags') {
            onConfirm('tags', tags);
        } else if (action === 'status') {
            onConfirm('status', status);
        } else if (action === 'folder') {
            onConfirm('folder', folderId);
        }
    };

    const getTitle = () => {
        switch (action) {
            case 'tags':
                return 'Bulk Edit Tags';
            case 'status':
                return 'Bulk Change Status';
            case 'folder':
                return 'Move to Folder';
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
            case 'folder':
                return `Move ${selectedCount} selected asset(s) to a folder. Select "Root" to move to the root level.`;
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

                    {action === 'folder' && (
                        <div className="space-y-2">
                            <Label>Destination Folder</Label>
                            <Select value={folderId || 'root'} onValueChange={(value) => setFolderId(value === 'root' ? null : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select folder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="root">📁 Root</SelectItem>
                                    {foldersResponse?.data.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id}>
                                            📁 {folder.name}
                                        </SelectItem>
                                    ))}
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
