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
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RunsheetEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTitle: string;
    currentEventId?: string | null;
    onSubmit: (data: { title: string; eventId?: string }) => Promise<void>;
    isLoading?: boolean;
}

export function RunsheetEditDialog({
    open,
    onOpenChange,
    currentTitle,
    currentEventId,
    onSubmit,
    isLoading = false,
}: RunsheetEditDialogProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const [title, setTitle] = useState(currentTitle);
    const [eventId, setEventId] = useState<string>(currentEventId || "_none");

    // Fetch events for the dropdown
    const { data: eventsData } = useQuery({
        queryKey: ['events', slug],
        queryFn: () => apiGet<{ data: any[] }>(`/org/${slug}/events`),
        enabled: open && !!slug,
    });

    // Update when dialog opens with new values
    useEffect(() => {
        if (open) {
            setTitle(currentTitle);
            setEventId(currentEventId || "_none");
        }
    }, [open, currentTitle, currentEventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        await onSubmit({
            title: title.trim(),
            eventId: eventId && eventId !== "_none" ? eventId : undefined,
        });
    };

    const handleClose = () => {
        if (!isLoading) {
            setTitle(currentTitle);
            setEventId(currentEventId || "_none");
            onOpenChange(false);
        }
    };

    const events = eventsData?.data || [];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Runsheet Title</DialogTitle>
                    <DialogDescription>
                        Update the title of this runsheet
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
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
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
