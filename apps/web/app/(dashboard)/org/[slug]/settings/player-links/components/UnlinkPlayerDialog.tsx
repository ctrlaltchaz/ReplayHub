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
import { apiDelete } from "@/lib/api/client";
import type { Player } from "@/types/roster";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

interface UnlinkPlayerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    player: Player;
    slug: string;
    onSuccess: () => void;
}

export function UnlinkPlayerDialog({
    open,
    onOpenChange,
    player,
    slug,
    onSuccess,
}: UnlinkPlayerDialogProps) {
    const queryClient = useQueryClient();

    const unlinkMutation = useMutation({
        mutationFn: async () => {
            return apiDelete(`/org/${slug}/players/${player.id}/link-user`, {
                slug,
                credentials: "include",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players`] });
            queryClient.invalidateQueries({ queryKey: [`/org/${slug}/players/${player.id}`] });
            onSuccess();
        },
    });

    const handleUnlink = async () => {
        try {
            await unlinkMutation.mutateAsync();
        } catch (error) {
            console.error("Failed to unlink player:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Unlink Player Account
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to unlink <strong>{player.gamerTag}</strong> from{" "}
                        <strong>{player.globalUser?.email}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                        This action will:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                        <li>Remove the connection between the player and user account</li>
                        <li>Keep all existing player data and statistics</li>
                        <li>Prevent the user from accessing this player profile</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                        You can re-link this player to any user account later.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={unlinkMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleUnlink}
                        disabled={unlinkMutation.isPending}
                    >
                        {unlinkMutation.isPending ? "Unlinking..." : "Unlink Player"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
