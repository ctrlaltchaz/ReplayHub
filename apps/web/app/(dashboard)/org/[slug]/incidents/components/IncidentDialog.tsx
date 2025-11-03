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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { CreateIncidentDto, Incident, IncidentCategory, IncidentSeverity, IncidentStatus, UpdateIncidentDto } from '@/types/incident';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateIncident } from '../hooks/useCreateIncident';
import { useEvents } from '../hooks/useEvents';
import { useOrgUsers } from '../hooks/useOrgUsers';
import { useUpdateIncident } from '../hooks/useUpdateIncident';

interface IncidentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'edit';
    orgSlug: string;
    incident?: Incident;
}

export function IncidentDialog({
    open,
    onOpenChange,
    mode,
    orgSlug,
    incident,
}: IncidentDialogProps) {
    const router = useRouter();
    const { toast } = useToast();
    const createMutation = useCreateIncident(orgSlug);
    const updateMutation = useUpdateIncident(orgSlug);

    const { data: events, isLoading: eventsLoading } = useEvents(orgSlug);
    const { data: users, isLoading: usersLoading } = useOrgUsers(orgSlug);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other' as IncidentCategory,
        severity: 'low' as IncidentSeverity,
        status: 'open' as IncidentStatus,
        eventId: '',
        ownerId: '',
        tags: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens or incident changes
    useEffect(() => {
        if (incident && mode === 'edit') {
            setFormData({
                title: incident.title,
                description: incident.description || '',
                category: incident.category,
                severity: incident.severity,
                status: incident.status,
                eventId: incident.eventId || '',
                ownerId: incident.ownerId || '',
                tags: incident.tags || '',
            });
        } else if (mode === 'create') {
            setFormData({
                title: '',
                description: '',
                category: 'other' as IncidentCategory,
                severity: 'low' as IncidentSeverity,
                status: 'open' as IncidentStatus,
                eventId: '',
                ownerId: '',
                tags: '',
            });
        }
        setErrors({});
    }, [incident, mode, open]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (mode === 'create') {
                const dto: CreateIncidentDto = {
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    category: formData.category,
                    severity: formData.severity,
                    eventId: formData.eventId && formData.eventId !== '' && formData.eventId !== 'none' ? formData.eventId : undefined,
                    ownerId: formData.ownerId && formData.ownerId !== '' && formData.ownerId !== 'none' ? formData.ownerId : undefined,
                    tags: formData.tags.trim() || undefined,
                };
                const result = await createMutation.mutateAsync(dto);
                toast({
                    title: 'Incident created',
                    description: 'The incident has been created successfully.',
                });
                onOpenChange(false);
                router.push(`/org/${orgSlug}/incidents/${result.id}`);
            } else if (incident) {
                const dto: UpdateIncidentDto = {
                    title: formData.title.trim(),
                    description: formData.description.trim() || undefined,
                    status: formData.status,
                    ownerId: formData.ownerId && formData.ownerId !== '' && formData.ownerId !== 'none' ? formData.ownerId : undefined,
                    tags: formData.tags.trim() || undefined,
                };
                await updateMutation.mutateAsync({
                    incidentId: incident.id,
                    data: dto,
                });
                toast({
                    title: 'Incident updated',
                    description: 'The incident has been updated successfully.',
                });
                onOpenChange(false);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create Incident' : 'Edit Incident'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Report a new incident to track and resolve.'
                            : 'Update the incident details.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            placeholder="Brief description of the incident"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            disabled={isLoading}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Detailed description of what happened"
                            className="min-h-[100px]"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, category: value })
                                }
                                disabled={isLoading || mode === 'edit'}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tech">Technical</SelectItem>
                                    <SelectItem value="comms">Communications</SelectItem>
                                    <SelectItem value="people">People</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {mode === 'edit' && (
                                <p className="text-xs text-muted-foreground">
                                    Category cannot be changed after creation
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="severity">
                                Severity <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, severity: value })
                                }
                                disabled={isLoading || mode === 'edit'}
                            >
                                <SelectTrigger id="severity">
                                    <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            {mode === 'edit' && (
                                <p className="text-xs text-muted-foreground">
                                    Severity cannot be changed after creation
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Status <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value: any) =>
                                setFormData({ ...formData, status: value })
                            }
                            disabled={isLoading || mode === 'create'}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                        </Select>
                        {mode === 'create' && (
                            <p className="text-xs text-muted-foreground">
                                New incidents always start as "Open"
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventId">Event (Optional)</Label>
                        <Select
                            value={formData.eventId || 'none'}
                            onValueChange={(value) =>
                                setFormData({ ...formData, eventId: value === 'none' ? '' : value })
                            }
                            disabled={isLoading || eventsLoading}
                        >
                            <SelectTrigger id="eventId">
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {events?.map((event) => (
                                    <SelectItem key={event.id} value={event.id}>
                                        {event.title} - {new Date(event.startAt).toLocaleDateString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ownerId">Owner (Optional)</Label>
                        <Select
                            value={formData.ownerId || 'none'}
                            onValueChange={(value) =>
                                setFormData({ ...formData, ownerId: value === 'none' ? '' : value })
                            }
                            disabled={isLoading || usersLoading}
                        >
                            <SelectTrigger id="ownerId">
                                <SelectValue placeholder="Assign to a user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {users?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.displayName} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                            id="tags"
                            placeholder="Comma-separated tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? mode === 'create'
                                    ? 'Creating...'
                                    : 'Updating...'
                                : mode === 'create'
                                    ? 'Create Incident'
                                    : 'Update Incident'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
