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
import { Textarea } from "@/components/ui/textarea";
import type { CreateRunsheetTemplateDto } from "@/types/runsheet-template-full";
import { FileText } from "lucide-react";
import { useState } from "react";

interface SaveAsTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    runsheetId: string;
    runsheetTitle: string;
    itemCount: number;
    onSubmit: (data: CreateRunsheetTemplateDto) => Promise<void>;
    isLoading?: boolean;
}

export function SaveAsTemplateDialog({
    open,
    onOpenChange,
    runsheetId,
    runsheetTitle,
    itemCount,
    onSubmit,
    isLoading,
}: SaveAsTemplateDialogProps) {
    const [name, setName] = useState(runsheetTitle);
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                runsheetId,
            });
            setName("");
            setDescription("");
        } catch (error) {
            // Error handled by parent
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setName(runsheetTitle);
            setDescription("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Save as Template
                        </DialogTitle>
                        <DialogDescription>
                            Save this runsheet ({itemCount} items) as a reusable template for future use
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Standard Tournament Runsheet"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe when to use this template..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
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
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? "Saving..." : "Save Template"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
