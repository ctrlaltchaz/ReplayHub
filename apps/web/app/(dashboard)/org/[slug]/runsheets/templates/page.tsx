'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RunsheetTemplate } from '@/types/runsheet-template-full';
import { ArrowLeft, Clock, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useDeleteRunsheetTemplate } from '../hooks/useDeleteRunsheetTemplate';
import { useRunsheetTemplates } from '../hooks/useRunsheetTemplates';
import { EditTemplateDialog } from './components/EditTemplateDialog';
import { ViewTemplateDialog } from './components/ViewTemplateDialog';

export default function RunsheetTemplatesPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const { data: templates, isLoading } = useRunsheetTemplates(slug);
    const deleteTemplate = useDeleteRunsheetTemplate(slug);
    const { toast } = useToast();

    const [viewTemplate, setViewTemplate] = useState<RunsheetTemplate | null>(null);
    const [editTemplate, setEditTemplate] = useState<RunsheetTemplate | null>(null);
    const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getTotalDuration = (template: RunsheetTemplate) => {
        return template.items.reduce((sum, item) => sum + item.durationMs, 0);
    };

    const handleDelete = async () => {
        if (!deleteTemplateId) return;

        try {
            await deleteTemplate.mutateAsync(deleteTemplateId);
            toast({
                title: 'Success',
                description: 'Template deleted successfully'
            });
            setDeleteTemplateId(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete template',
                variant: 'destructive'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Loading templates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href={`/org/${slug}/runsheets`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Runsheets
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold">Runsheet Templates</h1>
                    <p className="text-muted-foreground">
                        Manage your saved runsheet templates
                    </p>
                </div>
            </div>

            {!templates || templates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
                        <p className="text-muted-foreground text-center">
                            No templates found. Create a runsheet and save it as a template to get started.
                        </p>
                        <Link href={`/org/${slug}/runsheets`}>
                            <Button>Go to Runsheets</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{template.name}</span>
                                    <Badge variant="outline">
                                        {template.items.length} items
                                    </Badge>
                                </CardTitle>
                                {template.description && (
                                    <CardDescription className="line-clamp-2">
                                        {template.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Total: {formatDuration(getTotalDuration(template))}</span>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setViewTemplate(template)}
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => setEditTemplate(template)}
                                    >
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeleteTemplateId(template.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {viewTemplate && (
                <ViewTemplateDialog
                    template={viewTemplate}
                    open={!!viewTemplate}
                    onOpenChange={(open) => !open && setViewTemplate(null)}
                />
            )}

            {editTemplate && (
                <EditTemplateDialog
                    template={editTemplate}
                    open={!!editTemplate}
                    onOpenChange={(open) => !open && setEditTemplate(null)}
                    slug={slug}
                />
            )}

            <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
