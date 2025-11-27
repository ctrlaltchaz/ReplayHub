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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAssetFolders } from '../hooks/useAssetFolders';
import { useParams } from 'next/navigation';

interface DeleteFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    folderName?: string;
    folderId: string | null;
    assetCount: number;
    onConfirm: (action: 'delete-all' | 'move-assets', targetFolderId?: string | null) => void;
    isProcessing: boolean;
}

export function DeleteFolderDialog({
    open,
    onOpenChange,
    folderName,
    folderId,
    assetCount,
    onConfirm,
    isProcessing,
}: DeleteFolderDialogProps) {
    const params = useParams();
    const slug = params.slug as string;
    const { data: foldersResponse } = useAssetFolders(slug, { limit: 1000 });

    const [action, setAction] = useState<'delete-all' | 'move-assets'>('move-assets');
    const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

    // Build a hierarchical folder list for the dropdown
    const buildFolderHierarchy = () => {
        if (!foldersResponse?.data) return [];

        const folders = foldersResponse.data;
        const result: Array<{ id: string; name: string; level: number }> = [];

        const addFolder = (folder: typeof folders[0], level: number) => {
            // Don't include the folder being deleted or its children
            if (folder.id === folderId) {
                return;
            }

            result.push({
                id: folder.id,
                name: folder.name,
                level,
            });

            // Find and add children
            const children = folders.filter(f => f.parentId === folder.id);
            children.forEach(child => addFolder(child, level + 1));
        };

        // Start with root folders (no parent)
        const rootFolders = folders.filter(f => !f.parentId);
        rootFolders.forEach(folder => addFolder(folder, 0));

        return result;
    };

    const folderHierarchy = buildFolderHierarchy();

    const handleConfirm = () => {
        if (action === 'delete-all') {
            onConfirm('delete-all');
        } else {
            onConfirm('move-assets', targetFolderId);
        }
    };

    const canConfirm = action === 'delete-all' || (action === 'move-assets' && targetFolderId !== undefined);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Folder
                    </DialogTitle>
                    <DialogDescription>
                        {folderName && (
                            <span className="font-medium">
                                &quot;{folderName}&quot;{' '}
                            </span>
                        )}
                        {assetCount > 0 ? (
                            <>contains {assetCount} asset(s). What would you like to do with them?</>
                        ) : (
                            <>is empty and will be permanently deleted.</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {assetCount > 0 && (
                    <div className="space-y-4 py-4">
                        <RadioGroup value={action} onValueChange={(value) => setAction(value as typeof action)}>
                            <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value="move-assets" id="move-assets" />
                                <div className="flex-1">
                                    <Label htmlFor="move-assets" className="font-medium cursor-pointer">
                                        Move assets to another folder
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Keep the assets and move them to a different location
                                    </p>
                                </div>
                            </div>

                            {action === 'move-assets' && (
                                <div className="ml-6 mt-3 space-y-2">
                                    <Label>Destination Folder</Label>
                                    <Select
                                        value={targetFolderId || 'root'}
                                        onValueChange={(value) => setTargetFolderId(value === 'root' ? null : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select folder" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="root">📁 Root</SelectItem>
                                            {folderHierarchy.map((folder) => (
                                                <SelectItem key={folder.id} value={folder.id}>
                                                    {'\u00A0'.repeat(folder.level * 4)}📁 {folder.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value="delete-all" id="delete-all" />
                                <div className="flex-1">
                                    <Label htmlFor="delete-all" className="font-medium cursor-pointer text-destructive">
                                        Delete folder and all assets
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete the folder and all {assetCount} asset(s) inside
                                    </p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isProcessing || !canConfirm}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>Delete Folder</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
