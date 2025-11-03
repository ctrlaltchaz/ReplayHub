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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { RunsheetTemplate } from '@/types/runsheet-template-full';
import { useEffect, useState } from 'react';
import { useUpdateRunsheetTemplate } from '../../hooks/useUpdateRunsheetTemplate';

interface EditTemplateDialogProps {
    template: RunsheetTemplate;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    slug: string;
}

export function EditTemplateDialog({ template, open, onOpenChange, slug }: EditTemplateDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const updateTemplate = useUpdateRunsheetTemplate(slug);
    const { toast } = useToast();

    useEffect(() => {
        if (template) {
            setName(template.name);
            setDescription(template.description || '');
        }
    }, [template]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            await updateTemplate.mutateAsync({
                id: template.id,
                data: {
                    name: name.trim(),
                    description: description.trim() || undefined,
                },
            });
            toast({
                title: 'Success',
                description: 'Template updated successfully'
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update template',
                variant: 'destructive'
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Template</DialogTitle>
                    <DialogDescription>
                        Update the template name and description. Note: Items cannot be edited.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Standard Tournament Setup"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={updateTemplate.isPending}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe when to use this template..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={updateTemplate.isPending}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateTemplate.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateTemplate.isPending || !name.trim()}>
                            {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
