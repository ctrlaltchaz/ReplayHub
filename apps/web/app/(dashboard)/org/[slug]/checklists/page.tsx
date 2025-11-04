'use client';

import { PermissionGuard } from '@/components/permissions/PermissionGuard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { PERMISSIONS } from '@/lib/permissions/utils';
import type { ChecklistTemplate } from '@/types/checklist';
import { ClipboardCheck, Clock, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EditTemplateDialog } from './components/EditTemplateDialog';
import { NewChecklistDialog } from './components/NewChecklistDialog';
import { useChecklistTemplates } from './hooks/useChecklistTemplates';
import { useChecklists } from './hooks/useChecklists';
import { useDeleteChecklist } from './hooks/useDeleteChecklist';
import { useDeleteChecklistTemplate } from './hooks/useDeleteChecklistTemplate';

export default function ChecklistsPage() {
    usePageTitle('Checklists');
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { toast } = useToast();
    const [showNewChecklistDialog, setShowNewChecklistDialog] = useState(false);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const [checklistToDelete, setChecklistToDelete] = useState<string | null>(null);
    const { data: templates, isLoading: templatesLoading } = useChecklistTemplates(slug);
    const { data: checklists, isLoading: checklistsLoading } = useChecklists(slug);
    const deleteTemplate = useDeleteChecklistTemplate(slug);
    const deleteChecklist = useDeleteChecklist(slug);

    const activeChecklists = checklists?.filter(c => c.status !== 'done') || [];
    const completedChecklists = checklists?.filter(c => c.status === 'done') || [];

    const handleEditTemplate = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        setShowEditTemplate(true);
    };

    const handleDeleteTemplate = async () => {
        if (!templateToDelete) return;
        try {
            await deleteTemplate.mutateAsync(templateToDelete);
            toast({ title: 'Success', description: 'Template deleted successfully' });
            setTemplateToDelete(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete template',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteChecklist = async () => {
        if (!checklistToDelete) return;
        try {
            await deleteChecklist.mutateAsync(checklistToDelete);
            toast({ title: 'Success', description: 'Checklist deleted successfully' });
            setChecklistToDelete(null);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete checklist',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ClipboardCheck className="w-6 h-6" />
                            Checklists
                        </h1>
                        <p className="text-muted-foreground">Manage checklists and templates</p>
                    </div>
                </div>

                <Tabs defaultValue="checklists" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="checklists">Checklists</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="checklists" className="space-y-4">
                        <div className="flex justify-end">
                            <PermissionGuard required={PERMISSIONS.CHECKLISTS_EDIT}>
                                <Button onClick={() => setShowNewChecklistDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Checklist
                                </Button>
                            </PermissionGuard>
                        </div>
                        {checklistsLoading ? (
                            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : checklists && checklists.length > 0 ? (
                            <div className="space-y-6">
                                {/* Active Checklists */}
                                {activeChecklists.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">In Progress</h3>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {activeChecklists.map((checklist) => {
                                                const totalItems = Array.isArray(checklist.template?.itemsJson) ? checklist.template.itemsJson.length : 0;
                                                const completedCount = checklist.completedItems.length;
                                                const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;
                                                const isDue = checklist.dueAt && new Date(checklist.dueAt) < new Date();

                                                return (
                                                    <Card
                                                        key={checklist.id}
                                                        className="hover:shadow-md transition-shadow"
                                                    >
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <CardTitle
                                                                    className="text-lg cursor-pointer hover:underline flex-1"
                                                                    onClick={() => router.push(`/org/${slug}/checklists/${checklist.id}`)}
                                                                >
                                                                    {checklist.template?.title || checklist.title || 'Checklist'}
                                                                </CardTitle>
                                                                <div className="flex items-center gap-1">
                                                                    <Badge variant={checklist.status === 'in_progress' ? 'secondary' : 'outline'}>
                                                                        {checklist.status}
                                                                    </Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setChecklistToDelete(checklist.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent
                                                            className="space-y-3 cursor-pointer"
                                                            onClick={() => router.push(`/org/${slug}/checklists/${checklist.id}`)}
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-muted-foreground">Progress</span>
                                                                    <span className="font-medium">{Math.round(progress)}%</span>
                                                                </div>
                                                                <Progress value={progress} className="h-2" />
                                                                <p className="text-xs text-muted-foreground">
                                                                    {completedCount} of {totalItems} completed
                                                                </p>
                                                            </div>
                                                            {checklist.dueAt && (
                                                                <div className={`flex items-center gap-2 text-xs ${isDue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                                    <Clock className="w-3 h-3" />
                                                                    Due: {new Date(checklist.dueAt).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Completed Checklists */}
                                {completedChecklists.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-semibold">Completed</h3>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {completedChecklists.map((checklist) => {
                                                const totalItems = Array.isArray(checklist.template?.itemsJson) ? checklist.template.itemsJson.length : 0;

                                                return (
                                                    <Card
                                                        key={checklist.id}
                                                        className="hover:shadow-md transition-shadow opacity-75"
                                                    >
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <CardTitle
                                                                    className="text-lg cursor-pointer hover:underline flex-1"
                                                                    onClick={() => router.push(`/org/${slug}/checklists/${checklist.id}`)}
                                                                >
                                                                    {checklist.template?.title || checklist.title || 'Checklist'}
                                                                </CardTitle>
                                                                <div className="flex items-center gap-1">
                                                                    <Badge variant="default">done</Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setChecklistToDelete(checklist.id);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent
                                                            className="cursor-pointer"
                                                            onClick={() => router.push(`/org/${slug}/checklists/${checklist.id}`)}
                                                        >
                                                            <p className="text-xs text-muted-foreground">
                                                                All {totalItems} items completed
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <ClipboardCheck className="w-16 h-16 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Checklists</h3>
                                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">Create your first checklist to get started.</p>
                                    <PermissionGuard required={PERMISSIONS.CHECKLISTS_EDIT}>
                                        <Button onClick={() => setShowNewChecklistDialog(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Checklist
                                        </Button>
                                    </PermissionGuard>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    <TabsContent value="templates" className="space-y-4">
                        <div className="flex justify-end">
                            <PermissionGuard required={PERMISSIONS.CHECKLISTS_EDIT}>
                                <Button onClick={() => router.push(`/org/${slug}/checklists/new?type=template`)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Template
                                </Button>
                            </PermissionGuard>
                        </div>
                        {templatesLoading ? (
                            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : templates && templates.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {templates.map((template) => (
                                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-lg flex-1">{template.title}</CardTitle>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline">{template.scope}</Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTemplate(template);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTemplateToDelete(template.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                {template.itemsJson.length} {template.itemsJson.length === 1 ? 'item' : 'items'}
                                            </p>
                                            <PermissionGuard required={PERMISSIONS.CHECKLISTS_EDIT}>
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => router.push(`/org/${slug}/checklists/new?from=template&templateId=${template.id}`)}
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Create from Template
                                                </Button>
                                            </PermissionGuard>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <ClipboardCheck className="w-16 h-16 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No Templates</h3>
                                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">Create your first checklist template to get started.</p>
                                    <PermissionGuard required={PERMISSIONS.CHECKLISTS_EDIT}>
                                        <Button onClick={() => router.push(`/org/${slug}/checklists/new?type=template`)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            New Template
                                        </Button>
                                    </PermissionGuard>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
                <NewChecklistDialog open={showNewChecklistDialog} onOpenChange={setShowNewChecklistDialog} orgSlug={slug} />
                <EditTemplateDialog open={showEditTemplate} onOpenChange={setShowEditTemplate} orgSlug={slug} template={selectedTemplate} />
                <ConfirmDialog
                    open={!!templateToDelete}
                    onOpenChange={(open) => !open && setTemplateToDelete(null)}
                    title="Delete Template"
                    description="Are you sure you want to delete this template? This action cannot be undone. Templates with active checklists cannot be deleted."
                    onConfirm={handleDeleteTemplate}
                    loading={deleteTemplate.isPending}
                />
                <ConfirmDialog
                    open={!!checklistToDelete}
                    onOpenChange={(open) => !open && setChecklistToDelete(null)}
                    title="Delete Checklist"
                    description="Are you sure you want to delete this checklist? This action cannot be undone and all progress will be lost."
                    onConfirm={handleDeleteChecklist}
                    loading={deleteChecklist.isPending}
                />
            </div >
        </div >
    );
}
