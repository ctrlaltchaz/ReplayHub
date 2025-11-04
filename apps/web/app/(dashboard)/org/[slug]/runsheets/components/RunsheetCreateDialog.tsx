'use client';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiGet } from "@/lib/api/client";
import type { CreateRunsheetDto } from "@/types/runsheet";
import type { RunsheetTemplate } from "@/types/runsheet-template-full";
import { useQuery } from "@tanstack/react-query";
import { Clock, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface RunsheetCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateRunsheetDto & { templateId?: string }) => Promise<void>;
    isLoading?: boolean;
}

export function RunsheetCreateDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: RunsheetCreateDialogProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const [title, setTitle] = useState("");
    const [eventId, setEventId] = useState<string>("");
    const [templateId, setTemplateId] = useState<string>("");

    // Fetch events for the dropdown
    const { data: eventsData } = useQuery({
        queryKey: ['events', slug],
        queryFn: () => apiGet<{ data: any[] }>(`/org/${slug}/events`),
        enabled: open && !!slug,
    });

    // Fetch runsheet templates
    const { data: templatesData } = useQuery({
        queryKey: ['runsheet-templates-full', slug],
        queryFn: () => apiGet<{ data: RunsheetTemplate[] }>(`/org/${slug}/runsheet-templates-full`),
        enabled: open && !!slug,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const payload: CreateRunsheetDto & { templateId?: string } = {
            title: title.trim(),
        };

        // Only include optional fields if they have values
        if (eventId && eventId.trim() !== '') {
            payload.eventId = eventId;
        }
        if (templateId && templateId.trim() !== '') {
            payload.templateId = templateId;
        }

        await onSubmit(payload);
        setTitle("");
        setEventId("");
        setTemplateId("");
    };

    const handleClose = () => {
        if (!isLoading) {
            setTitle("");
            setEventId("");
            setTemplateId("");
            onOpenChange(false);
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const events = eventsData?.data || [];
    const templates = templatesData?.data || [];
    const selectedTemplate = templates.find(t => t.id === templateId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Runsheet</DialogTitle>
                    <DialogDescription>
                        Create a new runsheet from scratch or from a template
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Spring Tournament 2025"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event">Link to Event (Optional)</Label>
                            <Select value={eventId} onValueChange={setEventId} disabled={isLoading}>
                                <SelectTrigger id="event">
                                    <SelectValue placeholder="Select an event..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">No event</SelectItem>
                                    {events.map((event: any) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name} {event.date ? `(${new Date(event.date).toLocaleDateString()})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">Start From Template (Optional)</Label>
                            <Select value={templateId} onValueChange={setTemplateId} disabled={isLoading}>
                                <SelectTrigger id="template">
                                    <SelectValue placeholder="Create from scratch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">From scratch (empty)</SelectItem>
                                    {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.name} ({template.items.length} items)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTemplate && (
                            <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <FileText className="h-4 w-4" />
                                    Template Preview
                                </div>
                                {selectedTemplate.description && (
                                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                                )}
                                <div className="space-y-1">
                                    {selectedTemplate.items.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>#{item.idx} {item.title}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(item.durationMs)}
                                            </span>
                                        </div>
                                    ))}
                                    {selectedTemplate.items.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                            ... and {selectedTemplate.items.length - 5} more items
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !title.trim()}>
                            {isLoading ? "Creating..." : "Create Runsheet"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

