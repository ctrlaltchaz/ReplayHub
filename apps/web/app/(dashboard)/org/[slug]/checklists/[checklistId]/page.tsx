'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChecklistExecutionView } from '../components/ChecklistExecutionView';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EditChecklistDialog } from '../components/EditChecklistDialog';
import { useChecklist } from '../hooks/useChecklist';
import { useDeleteChecklist } from '../hooks/useDeleteChecklist';

export default function ChecklistDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const checklistId = params?.checklistId as string;
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);

    const { data: checklist, isLoading, error } = useChecklist(slug, checklistId);
    const deleteChecklist = useDeleteChecklist(slug);

    const handleDelete = async () => {
        try {
            await deleteChecklist.mutateAsync(checklistId);
            toast({ title: 'Success', description: 'Checklist deleted successfully' });
            router.push(`/org/${slug}/checklists`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete checklist',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !checklist) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">Checklist not found</p>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Checklists
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>
            <ChecklistExecutionView checklist={checklist} orgSlug={slug} />
            <EditChecklistDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                orgSlug={slug}
                checklist={checklist}
            />
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Checklist"
                description="Are you sure you want to delete this checklist? This action cannot be undone and all progress will be lost."
                onConfirm={handleDelete}
                loading={deleteChecklist.isPending}
            />
        </div>
    );
}
