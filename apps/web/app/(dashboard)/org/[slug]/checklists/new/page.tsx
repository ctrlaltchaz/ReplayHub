'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChecklistScope, ChecklistTemplateItem, CreateChecklistDto } from '@/types/checklist';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { useCreateChecklist } from '../hooks/useCreateChecklist';
import { useCreateChecklistTemplate } from '../hooks/useCreateChecklistTemplate';

interface NewChecklistPageProps {
    params: {
        slug: string;
    };
}

export default function NewChecklistPage({ params }: NewChecklistPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams?.get('from'); // 'template' or 'scratch'
    const type = searchParams?.get('type'); // 'checklist' or 'template'
    const templateIdFromUrl = searchParams?.get('templateId'); // Pre-selected template ID
    const queryClient = useQueryClient();

    const { data: templates } = useChecklistTemplates(params.slug);
    const { data: orgUsers } = useOrgUsers(params.slug);
    const createChecklistMutation = useCreateChecklist(params.slug);
    const createTemplateMutation = useCreateChecklistTemplate(params.slug);

    // Form state
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<ChecklistScope>('general');
    const [dueAt, setDueAt] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [saveAsTemplate, setSaveAsTemplate] = useState(false);
    const [items, setItems] = useState<ChecklistTemplateItem[]>([
        {
            text: '',
            category: 'General',
            assignedTo: '',
            priority: 'medium',
            estimatedMinutes: 30,
            required: true,
            evidence: false,
        },
    ]);

    // Form state for "from template" mode
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    useEffect(() => {
        // If creating a template, skip template selection
        if (type === 'template') {
            return;
        }
        // Pre-select template if provided in URL
        if (templateIdFromUrl) {
            setSelectedTemplateId(templateIdFromUrl);
        }
        if (!mode || (mode !== 'template' && mode !== 'scratch')) {
            router.push(`/org/${params.slug}/checklists`);
        }
    }, [mode, type, templateIdFromUrl, router, params.slug]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                text: '',
                category: 'General',
                assignedTo: '',
                priority: 'medium',
                estimatedMinutes: 30,
                required: true,
                evidence: false,
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (
        index: number,
        field: keyof ChecklistTemplateItem,
        value: any
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Creating a template
            if (type === 'template') {
                await createTemplateMutation.mutateAsync({
                    title,
                    scope,
                    itemsJson: items,
                });
                queryClient.invalidateQueries({ queryKey: ['checklist-templates', params.slug] });
                router.push(`/org/${params.slug}/checklists?tab=templates`);
                return;
            }

            // Creating a checklist from template
            if (mode === 'template') {
                const dto: CreateChecklistDto = {
                    templateId: selectedTemplateId,
                    dueAt: dueAt || undefined,
                    assigneeId: assigneeId || undefined,
                };
                await createChecklistMutation.mutateAsync(dto);
            } else {
                // Creating a checklist from scratch
                const dto: CreateChecklistDto = {
                    title,
                    scope,
                    dueAt: dueAt || undefined,
                    assigneeId: assigneeId || undefined,
                    itemsJson: items,
                };
                await createChecklistMutation.mutateAsync(dto);

                // If "save as template" is checked, create template too
                if (saveAsTemplate) {
                    await createTemplateMutation.mutateAsync({
                        title,
                        scope,
                        itemsJson: items,
                    });
                    queryClient.invalidateQueries({ queryKey: ['checklist-templates', params.slug] });
                }
            }

            queryClient.invalidateQueries({ queryKey: ['checklists', params.slug] });
            router.push(`/org/${params.slug}/checklists`);
        } catch (error) {
            console.error('Failed to create:', error);
        }
    };

    const isTemplate = type === 'template';
    const isFromTemplate = mode === 'template' && !isTemplate;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">
                    {isTemplate
                        ? 'Create Template'
                        : isFromTemplate
                            ? 'Create Checklist from Template'
                            : 'Create Checklist from Scratch'}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {isTemplate
                        ? 'Create a reusable template for future checklists'
                        : isFromTemplate
                            ? 'Select a template and provide details to create a new checklist'
                            : 'Build a custom checklist with your own items and categories'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            {isTemplate ? 'Define your template details' : 'Provide the basic details for your checklist'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isFromTemplate ? (
                            <div className="space-y-2">
                                <Label htmlFor="template">Template *</Label>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates?.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., Pre-Match Setup"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="scope">Scope *</Label>
                                    <Select value={scope} onValueChange={(value) => setScope(value as ChecklistScope)} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="event">Event</SelectItem>
                                            <SelectItem value="room">Room</SelectItem>
                                            <SelectItem value="kit">Kit</SelectItem>
                                            <SelectItem value="general">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        {!isTemplate && !isFromTemplate && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dueAt">Due Date</Label>
                                    <Input
                                        id="dueAt"
                                        type="date"
                                        value={dueAt}
                                        onChange={(e) => setDueAt(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigneeId">Assigned To</Label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgUsers?.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {isFromTemplate && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dueAt">Due Date</Label>
                                    <Input
                                        id="dueAt"
                                        type="date"
                                        value={dueAt}
                                        onChange={(e) => setDueAt(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="assigneeId">Assigned To</Label>
                                    <Select value={assigneeId} onValueChange={setAssigneeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {orgUsers?.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {(isTemplate || (!isFromTemplate && mode === 'scratch')) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Checklist Items</CardTitle>
                            <CardDescription>Add tasks to your checklist</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Item {index + 1}</Label>
                                        {items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Input
                                            value={item.text}
                                            onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                                            placeholder="Task description"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Input
                                                value={item.category}
                                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                                placeholder="e.g., Pre-Match"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select
                                                value={item.priority}
                                                onValueChange={(value) => handleItemChange(index, 'priority', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Assigned To</Label>
                                            <Select
                                                value={item.assignedTo}
                                                onValueChange={(value) => handleItemChange(index, 'assignedTo', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select member" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orgUsers?.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Est. Time (minutes)</Label>
                                            <Input
                                                type="number"
                                                value={item.estimatedMinutes}
                                                onChange={(e) =>
                                                    handleItemChange(index, 'estimatedMinutes', parseInt(e.target.value))
                                                }
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={item.required}
                                                onChange={(e) => handleItemChange(index, 'required', e.target.checked)}
                                            />
                                            Required
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={item.evidence}
                                                onChange={(e) => handleItemChange(index, 'evidence', e.target.checked)}
                                            />
                                            Requires Evidence
                                        </label>
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>

                            {!isTemplate && mode === 'scratch' && (
                                <div className="flex items-center space-x-2 pt-4 border-t">
                                    <Checkbox
                                        id="saveAsTemplate"
                                        checked={saveAsTemplate}
                                        onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="saveAsTemplate"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Save as template for future use
                                    </label>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createChecklistMutation.isPending || createTemplateMutation.isPending}
                    >
                        {createChecklistMutation.isPending || createTemplateMutation.isPending
                            ? 'Creating...'
                            : isTemplate
                                ? 'Create Template'
                                : 'Create Checklist'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
