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
import { Textarea } from "@/components/ui/textarea";
import type { CrewGroup } from "@/hooks/crew-groups";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CrewGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group?: CrewGroup | null;
    onSave: (data: Omit<CrewGroup, "id"> & { id?: string }) => Promise<void>;
}

export function CrewGroupDialog({ open, onOpenChange, group, onSave }: CrewGroupDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [displayOrder, setDisplayOrder] = useState(0);
    const [icon, setIcon] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (group) {
            setName(group.name);
            setDescription(group.description);
            setDisplayOrder(group.displayOrder);
            setIcon(group.icon || "");
        } else {
            setName("");
            setDescription("");
            setDisplayOrder(0);
            setIcon("");
        }
    }, [group, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            await onSave({
                id: group?.id,
                name: name.trim(),
                description: description?.trim() || "",
                displayOrder,
                icon: icon?.trim() || undefined,
            });
            onOpenChange(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{group ? "Edit Crew Group" : "Create Crew Group"}</DialogTitle>
                        <DialogDescription>
                            Define a crew group/role that can be used across templates and events.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Group Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Commentary, Production, Technical"
                                disabled={isSaving}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This will appear as a role option when assigning crew to events
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the responsibilities of this role..."
                                rows={3}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon</Label>
                            <Input
                                id="icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="e.g., Mic, Video, Monitor, Headphones"
                                disabled={isSaving}
                            />
                            <p className="text-xs text-muted-foreground">
                                Lucide icon name (optional). View icons at <a href="https://lucide.dev/icons" target="_blank" rel="noopener" className="underline">lucide.dev</a>
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {group ? "Update Group" : "Create Group"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
