'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { ChecklistPriority, ChecklistScope, ChecklistTemplateItem } from '@/types/checklist';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCreateChecklist } from '../hooks/useCreateChecklist';

interface CreateChecklistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
}

export function CreateChecklistDialog({ open, onOpenChange, orgSlug }: CreateChecklistDialogProps) {
    const { toast } = useToast();
    const createChecklist = useCreateChecklist(orgSlug);
    const { data: orgUsers } = useOrgUsers(orgSlug);
    const [title, setTitle] = useState('');
    const [scope, setScope] = useState<ChecklistScope>('general');
    const [dueAt, setDueAt] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [items, setItems] = useState<ChecklistTemplateItem[]>([
        { text: '', required: false, evidence: false, category: '', priority: 'medium', estimatedMinutes: 5 }
    ]);

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
        if (!title.trim()) {
            toast({ title: 'Error', description: 'Please enter a checklist title', variant: 'destructive' });
            return;
        }
        const validItems = items.filter((item) => item.text.trim());
        if (validItems.length === 0) {
            toast({ title: 'Error', description: 'Please add at least one item', variant: 'destructive' });
            return;
        }
        try {
            await createChecklist.mutateAsync({
                title: title.trim(),
                scope,
                itemsJson: validItems,
                dueAt: dueAt || undefined,
                assigneeId: assigneeId || undefined,
            });
            toast({ title: 'Success', description: 'Checklist created successfully' });
            setTitle('');
            setScope('general');
            setDueAt('');
            setAssigneeId('');
            setItems([{ text: '', required: false, evidence: false, category: '', priority: 'medium', estimatedMinutes: 5 }]);
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create checklist', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Checklist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Checklist Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Setup Checklist" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <Label htmlFor="dueAt">Due Date (Optional)</Label>
                            <Input
                                id="dueAt"
                                type="datetime-local"
                                value={dueAt}
                                onChange={(e) => setDueAt(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee (Optional)</Label>
                        <Select value={assigneeId} onValueChange={setAssigneeId}>
                            <SelectTrigger id="assignee"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {orgUsers?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>{user.displayName || user.email}</SelectItem>
                                ))}
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
                    <Button onClick={handleSubmit} disabled={createChecklist.isPending}>{createChecklist.isPending ? 'Creating...' : 'Create Checklist'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
