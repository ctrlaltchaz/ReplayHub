"use client";

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
import { useState } from "react";

interface CreateLineupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { eventId: string; teamId: string; title?: string }) => void;
    isLoading?: boolean;
    events: Array<{ id: string; title: string; startAt: string }>;
    teams: Array<{ id: string; name: string; game: string }>;
}

export function CreateLineupDialog({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    events,
    teams,
}: CreateLineupDialogProps) {
    const [formData, setFormData] = useState({
        eventId: "",
        teamId: "",
        title: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.eventId || !formData.teamId) return;
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Lineup</DialogTitle>
                        <DialogDescription>
                            Create a new lineup for an event
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="eventId">Event *</Label>
                            <Select
                                value={formData.eventId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, eventId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map((event) => {
                                        const eventDate = event.startAt ? new Date(event.startAt) : null;
                                        const dateStr = eventDate && !isNaN(eventDate.getTime())
                                            ? eventDate.toLocaleDateString('en-GB')
                                            : 'No date';
                                        return (
                                            <SelectItem key={event.id} value={event.id}>
                                                {event.title} - {dateStr}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teamId">Team *</Label>
                            <Select
                                value={formData.teamId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, teamId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name} ({team.game})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title (Optional)</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Finals Lineup"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>
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
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.eventId || !formData.teamId}
                        >
                            {isLoading ? "Creating..." : "Create Lineup"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
