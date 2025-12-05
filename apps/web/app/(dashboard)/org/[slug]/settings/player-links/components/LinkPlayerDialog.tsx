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
import { apiPost } from "@/lib/api/client";
import type { Player } from "@/types/roster";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface OrgUser {
    id: string;
    globalUserId?: string | null;
    email: string;
    displayName: string;
    isActive: boolean;
}

interface LinkPlayerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    player: Player;
    orgUsers: OrgUser[];
    slug: string;
    onSuccess: () => void;
}

export function LinkPlayerDialog({
    open,
    onOpenChange,
    player,
    orgUsers,
    slug,
    onSuccess,
}: LinkPlayerDialogProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const queryClient = useQueryClient();

    const linkMutation = useMutation({
        mutationFn: async (userId: string) => {
            return apiPost(
                `/org/${slug}/players/${player.id}/link-user`,
                { userId },
                { slug, credentials: "include" }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players/${player.id}`] });
            onSuccess();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;

        try {
            await linkMutation.mutateAsync(selectedUserId);
            setSelectedUserId("");
        } catch (error) {
            console.error("Failed to link player:", error);
        }
    };

    const availableUsers = orgUsers.filter(
        (u) => u.isActive && u.globalUserId && u.globalUserId !== player.globalUserId
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link Player to User Account</DialogTitle>
                    <DialogDescription>
                        Connect <strong>{player.gamerTag}</strong> to an organization user account
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select User</label>
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a user account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No available users to link
                                        </div>
                                    ) : (
                                        availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={user.globalUserId!}>
                                                <div className="flex flex-col">
                                                    <span>{user.displayName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                This will sync user profile data to the player profile
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={linkMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!selectedUserId || linkMutation.isPending}
                        >
                            {linkMutation.isPending ? "Linking..." : "Link Player"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
