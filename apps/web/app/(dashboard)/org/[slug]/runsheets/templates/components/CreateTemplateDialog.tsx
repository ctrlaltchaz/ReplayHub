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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

// Temporary type until proper types are defined - matches what the form collects
type CreateRunsheetItemTemplateDto = {
    idx?: number;
    title?: string;
    name?: string;
    type?: string;
    ownerId?: string;
    durationMs: number;
    location?: string;
    equipment?: string;
    priority?: string;
    notes?: string;
    description?: string;
};

interface CreateTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateRunsheetItemTemplateDto) => Promise<void>;
    isLoading?: boolean;
}

export function CreateTemplateDialog({ open, onOpenChange, onSubmit, isLoading }: CreateTemplateDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState("");
    const [location, setLocation] = useState("");
    const [equipment, setEquipment] = useState("");
    const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'critical'>("normal");
    const [notes, setNotes] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const mins = parseInt(minutes) || 0;
        const secs = parseInt(seconds) || 0;
        const durationMs = (mins * 60 + secs) * 1000;

        if (!name.trim()) return;

        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                type: type || undefined,
                durationMs,
                location: location.trim() || undefined,
                equipment: equipment.trim() || undefined,
                priority: priority,
                notes: notes.trim() || undefined,
            });
            // Reset form
            setName("");
            setDescription("");
            setType("");
            setMinutes("");
            setSeconds("");
            setLocation("");
            setEquipment("");
            setPriority("normal");
            setNotes("");
        } catch (error) {
            // Error handled by parent
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create Runsheet Item Template
                        </DialogTitle>
                        <DialogDescription>
                            Create a reusable template for common runsheet segments
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Opening Segment"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Brief description of this template"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Type and Priority Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={type || "none"}
                                    onValueChange={(value) => setType(value === "none" ? "" : value)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="segment">Segment</SelectItem>
                                        <SelectItem value="break">Break</SelectItem>
                                        <SelectItem value="setup">Setup</SelectItem>
                                        <SelectItem value="teardown">Teardown</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                        <SelectItem value="performance">Performance</SelectItem>
                                        <SelectItem value="interview">Interview</SelectItem>
                                        <SelectItem value="transition">Transition</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={priority}
                                    onValueChange={(value) => setPriority(value as any)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <Label>Default Duration</Label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="MM"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        disabled={isLoading}
                                        min="0"
                                        max="999"
                                    />
                                    <span className="text-xs text-muted-foreground mt-1">Minutes</span>
                                </div>
                                <span className="text-2xl font-bold text-muted-foreground">:</span>
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="SS"
                                        value={seconds}
                                        onChange={(e) => setSeconds(e.target.value)}
                                        disabled={isLoading}
                                        min="0"
                                        max="59"
                                    />
                                    <span className="text-xs text-muted-foreground mt-1">Seconds</span>
                                </div>
                            </div>
                        </div>

                        {/* Location and Equipment Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g. Main Stage"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Equipment */}
                            <div className="space-y-2">
                                <Label htmlFor="equipment">Equipment</Label>
                                <Input
                                    id="equipment"
                                    placeholder="e.g. Mic, Camera"
                                    value={equipment}
                                    onChange={(e) => setEquipment(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Default notes or instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={isLoading}
                                rows={3}
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
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? "Creating..." : "Create Template"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
