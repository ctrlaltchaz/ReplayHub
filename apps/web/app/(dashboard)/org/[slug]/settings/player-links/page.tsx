"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api/client";
import { getServerUrl } from "@/lib/api/config";
import type { Player } from "@/types/roster";
import { useQuery } from "@tanstack/react-query";
import { Link2, Unlink, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LinkPlayerDialog } from "./components/LinkPlayerDialog";
import { UnlinkPlayerDialog } from "./components/UnlinkPlayerDialog";

interface OrgUser {
    id: string;
    globalUserId?: string | null;
    email: string;
    displayName: string;
    isActive: boolean;
}

export default function PlayerLinksPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
    const [filter, setFilter] = useState<"all" | "linked" | "unlinked">("all");

    const { data: players = [], isLoading: loadingPlayers } = useQuery({
        queryKey: [`/org/${slug}/players`],
        queryFn: async () => {
            return apiGet<Player[]>(`/org/${slug}/players`, {
                slug,
                credentials: "include",
            });
        },
        enabled: !!slug,
    });

    const { data: orgUsers = [], isLoading: loadingUsers } = useQuery({
        queryKey: [`/org/${slug}/users`],
        queryFn: async () => {
            const data = await apiGet<{ users: OrgUser[] }>(`/org/${slug}/users`, {
                slug,
                credentials: "include",
            });
            return data.users;
        },
        enabled: !!slug,
    });

    const handleLinkClick = (player: Player) => {
        setSelectedPlayer(player);
        setShowLinkDialog(true);
    };

    const handleUnlinkClick = (player: Player) => {
        setSelectedPlayer(player);
        setShowUnlinkDialog(true);
    };

    const handleLinkSuccess = () => {
        setShowLinkDialog(false);
        setSelectedPlayer(null);
        toast({
            title: "Player linked",
            description: "Player has been successfully linked to the user account.",
        });
    };

    const handleUnlinkSuccess = () => {
        setShowUnlinkDialog(false);
        setSelectedPlayer(null);
        toast({
            title: "Player unlinked",
            description: "Player has been unlinked from the user account.",
        });
    };

    const filteredPlayers = players.filter((player) => {
        if (filter === "linked") return !!player.globalUserId;
        if (filter === "unlinked") return !player.globalUserId;
        return true;
    });

    const linkedCount = players.filter((p) => p.globalUserId).length;
    const unlinkedCount = players.filter((p) => !p.globalUserId).length;

    if (loadingPlayers || loadingUsers) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-64 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold tracking-tight">Player Account Links</h2>
                <p className="text-muted-foreground">
                    Connect player profiles to user accounts for unified access
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Total Players</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{players.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Linked Accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{linkedCount}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Unlinked Players</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-orange-600">{unlinkedCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    All ({players.length})
                </Button>
                <Button
                    variant={filter === "linked" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("linked")}
                >
                    Linked ({linkedCount})
                </Button>
                <Button
                    variant={filter === "unlinked" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("unlinked")}
                >
                    Unlinked ({unlinkedCount})
                </Button>
            </div>

            {/* Players Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Player Links</CardTitle>
                    <CardDescription>
                        View and manage player-user account connections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Linked Account</TableHead>
                                <TableHead>Link Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPlayers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No players found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPlayers.map((player) => (
                                    <TableRow key={player.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {player.avatar ? (
                                                    <img
                                                        src={`${getServerUrl()}${player.avatar}`}
                                                        alt={player.gamerTag}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{player.gamerTag}</p>
                                                    {player.realName && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {player.realName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {player.role || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={player.isActive ? "default" : "secondary"}>
                                                {player.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {player.globalUser ? (
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {player.globalUser.name || player.globalUser.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {player.globalUser.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {player.globalUserId ? (
                                                <Badge variant="default" className="bg-green-600">
                                                    <Link2 className="h-3 w-3 mr-1" />
                                                    Linked
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <Unlink className="h-3 w-3 mr-1" />
                                                    Not Linked
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {player.globalUserId ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnlinkClick(player)}
                                                >
                                                    <Unlink className="h-4 w-4 mr-1" />
                                                    Unlink
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleLinkClick(player)}
                                                >
                                                    <Link2 className="h-4 w-4 mr-1" />
                                                    Link
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialogs */}
            {selectedPlayer && (
                <>
                    <LinkPlayerDialog
                        open={showLinkDialog}
                        onOpenChange={setShowLinkDialog}
                        player={selectedPlayer}
                        orgUsers={orgUsers}
                        slug={slug}
                        onSuccess={handleLinkSuccess}
                    />
                    <UnlinkPlayerDialog
                        open={showUnlinkDialog}
                        onOpenChange={setShowUnlinkDialog}
                        player={selectedPlayer}
                        slug={slug}
                        onSuccess={handleUnlinkSuccess}
                    />
                </>
            )}
        </div>
    );
}
