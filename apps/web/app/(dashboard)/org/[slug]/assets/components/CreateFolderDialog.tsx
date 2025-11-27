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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { CreateFolderDto } from '@/types/asset';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useCreateFolder } from '../hooks/useCreateFolder';

interface CreateFolderDialogProps {
    orgSlug: string;
    parentId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateFolderDialog({
    orgSlug,
    parentId,
    open,
    onOpenChange,
    onSuccess,
}: CreateFolderDialogProps) {
    const [name, setName] = useState('');
    const { toast } = useToast();
    const createFolder = useCreateFolder(orgSlug);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast({
                title: 'Error',
                description: 'Folder name is required',
                variant: 'destructive',
            });
            return;
        }

        try {
            const data: CreateFolderDto = {
                name: name.trim(),
                ...(parentId && { parentId }),
            };

            await createFolder.mutateAsync(data);

            toast({
                title: 'Success',
                description: 'Folder created successfully',
            });

            setName('');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create folder',
                variant: 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                        <DialogDescription>
                            Create a new folder to organize your assets.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="folder-name">Folder Name</Label>
                            <Input
                                id="folder-name"
                                placeholder="Enter folder name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={createFolder.isPending}
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={createFolder.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createFolder.isPending || !name.trim()}>
                            {createFolder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Folder
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
