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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface OrgUser {
    id: string;
    globalUserId?: string | null;
    email: string;
    displayName: string;
    isActive: boolean;
}

interface LinkUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (userId: string) => Promise<void>;
    orgUsers: OrgUser[];
    isLoading: boolean;
}

export function LinkUserDialog({
    open,
    onOpenChange,
    onSubmit,
    orgUsers,
    isLoading,
}: LinkUserDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;

        await onSubmit(selectedUserId);
        setSelectedUserId("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link to User Account</DialogTitle>
                    <DialogDescription>
                        Connect this player profile to an organization user account
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organization User</label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgUsers
                                        .filter(u => u.isActive && u.globalUserId)
                                        .map((user) => (
                                            <SelectItem key={user.id} value={user.globalUserId!}>
                                                {user.displayName} ({user.email})
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
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!selectedUserId || isLoading}>
                            {isLoading ? "Linking..." : "Link User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
