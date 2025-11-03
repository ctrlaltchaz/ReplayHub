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
import { useParams } from "next/navigation";
import { useState } from "react";
import { useOrgUsers } from "../../hooks/useOrgUsers";

interface AddItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: {
        title: string;
        type?: string;
        ownerId: string;
        durationMs: number;
        location?: string;
        equipment?: string;
        priority?: 'low' | 'normal' | 'high' | 'critical';
        notes: string;
    }) => Promise<void>;
    isLoading?: boolean;
}

export function AddItemDialog({ open, onOpenChange, onSubmit, isLoading }: AddItemDialogProps) {
    const params = useParams();
    const slug = params?.slug as string;
    const { data: orgUsers, isLoading: isLoadingUsers } = useOrgUsers(slug);

    const [title, setTitle] = useState("");
    const [type, setType] = useState("");
    const [ownerId, setOwnerId] = useState("");
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

        if (!title.trim()) return;

        try {
            await onSubmit({
                title: title.trim(),
                type: type.trim() || undefined,
                ownerId: ownerId.trim(),
                durationMs,
                location: location.trim() || undefined,
                equipment: equipment.trim() || undefined,
                priority: priority,
                notes: notes.trim(),
            });
            // Reset form
            setTitle("");
            setType("");
            setOwnerId("");
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
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add Runsheet Item
                        </DialogTitle>
                        <DialogDescription>
                            Add a new item to the runsheet schedule
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Item title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isLoading}
                                required
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
                            <Label>Duration *</Label>
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

                        {/* Owner */}
                        <div className="space-y-2">
                            <Label htmlFor="ownerId">Owner</Label>
                            <Select
                                value={ownerId || "none"}
                                onValueChange={(value) => setOwnerId(value === "none" ? "" : value)}
                                disabled={isLoading || isLoadingUsers}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an owner (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {orgUsers?.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.displayName} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                The person responsible for this item
                            </p>
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
                                placeholder="Additional notes or instructions..."
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
                        <Button type="submit" disabled={isLoading || !title.trim()}>
                            {isLoading ? "Adding..." : "Add Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
