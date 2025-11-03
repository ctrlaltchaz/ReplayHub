'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { ChecklistPriority, ChecklistScope, ChecklistTemplate, ChecklistTemplateItem } from '@/types/checklist';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUpdateChecklistTemplate } from '../hooks/useUpdateChecklistTemplate';

interface EditTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    template: ChecklistTemplate | null;
}

export function EditTemplateDialog({ open, onOpenChange, orgSlug, template }: EditTemplateDialogProps) {
    const { toast } = useToast();
    const updateTemplate = useUpdateChecklistTemplate(orgSlug);
    const { data: orgUsers } = useOrgUsers(orgSlug);
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<ChecklistScope>('general');
    const [items, setItems] = useState<ChecklistTemplateItem[]>([
        { text: '', required: false, evidence: false, category: '', priority: 'medium', estimatedMinutes: 5 }
    ]);

    // Populate form when template changes
    useEffect(() => {
        if (template) {
            setTitle(template.title);
            setScope(template.scope as ChecklistScope);
            const templateItems = Array.isArray(template.itemsJson) ? template.itemsJson : [];
            setItems(templateItems.length > 0 ? templateItems : [
                { text: '', required: false, evidence: false, category: '', priority: 'medium', estimatedMinutes: 5 }
            ]);
        }
    }, [template]);

    const addItem = () => {
        setItems([...items, { text: '', required: false, evidence: false, category: '', priority: 'medium', estimatedMinutes: 5 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, updates: Partial<ChecklistTemplateItem>) => {
        setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
    };

    const handleSubmit = async () => {
        if (!template) return;

        if (!title.trim()) {
            toast({ title: 'Error', description: 'Please enter a template title', variant: 'destructive' });
            return;
        }
        const validItems = items.filter((item) => item.text.trim());
        if (validItems.length === 0) {
            toast({ title: 'Error', description: 'Please add at least one item', variant: 'destructive' });
            return;
        }
        try {
            await updateTemplate.mutateAsync({
                templateId: template.id,
                data: {
                    title: title.trim(),
                    scope,
                    itemsJson: validItems
                }
            });
            toast({ title: 'Success', description: 'Template updated successfully' });
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' });
        }
    };

    if (!template) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Checklist Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Template Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Setup Checklist" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="scope">Scope</Label>
                        <Select value={scope} onValueChange={(val) => setScope(val as ChecklistScope)}>
                            <SelectTrigger id="scope"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="event">Event</SelectItem>
                                <SelectItem value="room">Room</SelectItem>
                                <SelectItem value="kit">Kit</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Checklist Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-1" />Add Item
                            </Button>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 space-y-3">
                                        <Input value={item.text} onChange={(e) => updateItem(index, { text: e.target.value })} placeholder="Item description" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs">Category</Label>
                                                <Input value={item.category || ''} onChange={(e) => updateItem(index, { category: e.target.value })} placeholder="Setup, Teardown" className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Assigned To</Label>
                                                <Select value={item.assignedTo || 'unassigned'} onValueChange={(val) => updateItem(index, { assignedTo: val === 'unassigned' ? undefined : val })}>
                                                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select user" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {orgUsers?.map((user) => (<SelectItem key={user.id} value={user.id}>{user.displayName || user.email}</SelectItem>))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Priority</Label>
                                                <Select value={item.priority || 'medium'} onValueChange={(val) => updateItem(index, { priority: val as ChecklistPriority })}>
                                                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="medium">Medium</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Est. Time (min)</Label>
                                                <Input type="number" min="1" value={item.estimatedMinutes || ''} onChange={(e) => updateItem(index, { estimatedMinutes: parseInt(e.target.value) || undefined })} placeholder="5" className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox id={`required-${index}`} checked={item.required} onCheckedChange={(checked) => updateItem(index, { required: !!checked })} />
                                                <Label htmlFor={`required-${index}`} className="text-sm font-normal">Required</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Checkbox id={`evidence-${index}`} checked={item.evidence} onCheckedChange={(checked) => updateItem(index, { evidence: !!checked })} />
                                                <Label htmlFor={`evidence-${index}`} className="text-sm font-normal">Evidence Required</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={updateTemplate.isPending}>{updateTemplate.isPending ? 'Updating...' : 'Update Template'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
