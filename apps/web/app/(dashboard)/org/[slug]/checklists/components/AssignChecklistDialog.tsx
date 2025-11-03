'use client';

import { useOrgUsers } from '@/app/(dashboard)/org/[slug]/runsheets/hooks/useOrgUsers';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { useCreateChecklist } from '../hooks/useCreateChecklist';

interface AssignChecklistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orgSlug: string;
    eventId?: string;
}

export function AssignChecklistDialog({ open, onOpenChange, orgSlug, eventId }: AssignChecklistDialogProps) {
    const { toast } = useToast();
    const { data: templates, isLoading } = useChecklistTemplates(orgSlug);
    const { data: orgUsers } = useOrgUsers(orgSlug);
    const createChecklist = useCreateChecklist(orgSlug);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');
    const [assigneeId, setAssigneeId] = useState<string>('');

    const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);

    const handleSubmit = async () => {
        if (!selectedTemplateId) {
            toast({ title: 'Error', description: 'Please select a template', variant: 'destructive' });
            return;
        }

        try {
            await createChecklist.mutateAsync({
                templateId: selectedTemplateId,
                scopeRef: eventId,
                dueAt: dueDate || undefined,
                assigneeId: assigneeId || undefined,
            });

            toast({ title: 'Success', description: 'Checklist created successfully' });
            setSelectedTemplateId('');
            setDueDate('');
            setAssigneeId('');
            onOpenChange(false);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create checklist', variant: 'destructive' });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Checklist from Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="template">Select Template</Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger id="template">
                                <SelectValue placeholder="Choose a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                                {templates?.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.title} ({template.scope})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedTemplate && (
                        <div className="p-3 bg-muted rounded-md text-sm">
                            <p className="font-medium mb-1">{selectedTemplate.title}</p>
                            <p className="text-muted-foreground">
                                {Array.isArray(selectedTemplate.itemsJson)
                                    ? selectedTemplate.itemsJson.length
                                    : 0} items • Scope: {selectedTemplate.scope}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date (Optional)</Label>
                        <div className="relative">
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="pl-10"
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assign To (Optional)</Label>
                        <Select value={assigneeId} onValueChange={(val) => setAssigneeId(val === 'unassigned' ? '' : val)}>
                            <SelectTrigger id="assignee">
                                <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {orgUsers?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.displayName || user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createChecklist.isPending || !selectedTemplateId}>
                        {createChecklist.isPending ? 'Creating...' : 'Create Checklist'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
