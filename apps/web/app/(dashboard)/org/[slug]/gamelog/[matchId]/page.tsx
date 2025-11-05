"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    FileText,
    Loader2,
    Map,
    Target,
    Trash2,
    Trophy,
    Upload,
    Users,
    XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useApproveMatch } from "../hooks/useApproveMatch";
import { useDeleteMatch } from "../hooks/useDeleteMatch";
import { useMatch } from "../hooks/useMatch";
import { useSubmitMatch } from "../hooks/useSubmitMatch";
import { useUnapproveMatch } from "../hooks/useUnapproveMatch";

export default function MatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const matchId = params?.matchId as string;
    const { hasPermission } = useAuth();
    const { toast } = useToast();

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [showUnapproveDialog, setShowUnapproveDialog] = useState(false);
    const [unapproveReason, setUnapproveReason] = useState("");

    const { data: match, isLoading, error } = useMatch(slug, matchId);
    const submitMatch = useSubmitMatch(slug, matchId);
    const approveMatch = useApproveMatch(slug, matchId);
    const unapproveMatch = useUnapproveMatch(slug, matchId);
    const deleteMatch = useDeleteMatch(slug, matchId);

    const canManage = hasPermission("gamelog.manage");
    const canApprove = hasPermission("gamelog.approve");
    const canView = hasPermission("gamelog.view");

    const handleSubmit = async () => {
        try {
            await submitMatch.mutateAsync();
            toast({
                title: "Success",
                description: "Match submitted for approval",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit match",
                variant: "destructive",
            });
        }
    };

    const handleApprove = async () => {
        try {
            await approveMatch.mutateAsync();
            toast({
                title: "Success",
                description: "Match approved",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to approve match",
                variant: "destructive",
            });
        }
    };

    const handleUnapprove = async () => {
        if (!unapproveReason.trim()) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for unapproving this match",
                variant: "destructive",
            });
            return;
        }

        try {
            await unapproveMatch.mutateAsync(unapproveReason);
            setShowUnapproveDialog(false);
            setUnapproveReason("");
            toast({
                title: "Success",
                description: "Match unapproved",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to unapprove match",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        // Verify the confirmation text matches
        if (deleteConfirmation !== match?.opponent) {
            toast({
                title: "Verification Failed",
                description: "The opponent name you entered doesn't match",
                variant: "destructive",
            });
            return;
        }

        try {
            await deleteMatch.mutateAsync();
            setShowDeleteDialog(false);
            setDeleteConfirmation("");
            toast({
                title: "Success",
                description: "Match deleted successfully",
            });
            router.push(`/org/${slug}/gamelog`);
        } catch (error: any) {
            setShowDeleteDialog(false);
            setDeleteConfirmation("");
            // If it's a 404, the match is already gone, so navigate anyway
            if (error?.response?.status === 404 || error?.message?.includes('not found')) {
                router.push(`/org/${slug}/gamelog`);
            } else {
                toast({
                    title: "Error",
                    description: error?.message || "Failed to delete match",
                    variant: "destructive",
                });
            }
        }
    };

    const handleDownloadPDF = () => {
        window.open(`http://localhost:3001/api/org/${slug}/gamelog/matches/${matchId}/report.pdf`, "_blank");
    };

    const handleDownloadCSV = () => {
        window.open(`http://localhost:3001/api/org/${slug}/gamelog/matches/${matchId}/stats.csv`, "_blank");
    };

    const getResultBadge = (result: string) => {
        const colors = {
            win: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            loss: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            draw: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        return colors[result as keyof typeof colors] || colors.draw;
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
            submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        };
        return colors[status as keyof typeof colors] || colors.draft;
    };

    if (!canView) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to view match details.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Failed to load match details</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push(`/org/${slug}/gamelog`)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Game Log
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/org/${slug}/gamelog`)}
                            className="mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Game Log
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {match.team?.name || "Team"} vs {match.opponent}
                            </h1>
                            {match.result && (
                                <Badge variant="secondary" className={getResultBadge(match.result)}>
                                    {match.result.toUpperCase()}
                                </Badge>
                            )}
                            <Badge variant="secondary" className={getStatusBadge(match.status)}>
                                {match.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {match.score && `Score: ${match.score}`}
                            {match.score && match.startedAt && " • "}
                            {match.startedAt && format(parseISO(match.startedAt), "MMMM dd, yyyy")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Submit/Approve Actions */}
                        {canManage && match.status === "draft" && (
                            <Button onClick={handleSubmit} disabled={submitMatch.isPending}>
                                <Upload className="h-4 w-4 mr-2" />
                                Submit for Approval
                            </Button>
                        )}
                        {canApprove && match.status === "submitted" && (
                            <Button onClick={handleApprove} disabled={approveMatch.isPending}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                        )}
                        {canApprove && match.status === "approved" && (
                            <Button
                                variant="outline"
                                onClick={() => setShowUnapproveDialog(true)}
                                disabled={unapproveMatch.isPending}
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Unapprove
                            </Button>
                        )}                        {/* Export Actions */}
                        {match.status === "approved" && (
                            <>
                                <Button variant="outline" onClick={handleDownloadPDF}>
                                    <Download className="h-4 w-4 mr-2" />
                                    PDF Report
                                </Button>
                                <Button variant="outline" onClick={handleDownloadCSV}>
                                    <Download className="h-4 w-4 mr-2" />
                                    CSV Stats
                                </Button>
                            </>
                        )}

                        {/* Edit/Delete Actions */}
                        {canManage && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.push(`/org/${slug}/gamelog/${matchId}/edit`)
                                    }
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Match
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Match Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Match Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Team:</span>
                                <span className="font-medium">
                                    {match.team?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Opponent:</span>
                                <span className="font-medium">
                                    {match.opponent}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tournament:</span>
                                <span className="font-medium">
                                    {match.tournament || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Stage:</span>
                                <span className="font-medium">
                                    {match.stage || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Best Of:</span>
                                <span className="font-medium">
                                    {match.bestOf}
                                </span>
                            </div>
                            {match.startedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Start Date:</span>
                                    <span className="font-medium">
                                        {format(parseISO(match.startedAt), "PPP")}
                                    </span>
                                </div>
                            )}
                            {match.endedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">End Date:</span>
                                    <span className="font-medium">
                                        {format(parseISO(match.endedAt), "PPP")}
                                    </span>
                                </div>
                            )}
                            {match.result && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Result:</span>
                                    <Badge variant="secondary" className={getResultBadge(match.result)}>
                                        {match.result.toUpperCase()}
                                    </Badge>
                                </div>
                            )}
                            {match.score && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Final Score:</span>
                                    <span className="font-medium">
                                        {match.score}
                                    </span>
                                </div>
                            )}
                            {match.vodUrl && (
                                <div className="pt-3 border-t">
                                    <span className="text-muted-foreground text-sm">VOD:</span>
                                    <a href={match.vodUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mt-1">
                                        Watch Recording
                                    </a>
                                </div>
                            )}
                            {match.notes && (
                                <div className="pt-3 border-t">
                                    <span className="text-muted-foreground text-sm">Notes:</span>
                                    <p className="text-sm mt-1">{match.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Status Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="secondary" className={getStatusBadge(match.status)}>
                                    {match.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="text-sm">
                                    {format(parseISO(match.createdAt), "PPp")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated:</span>
                                <span className="text-sm">
                                    {format(parseISO(match.updatedAt), "PPp")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map Games */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Map className="h-4 w-4" />
                                Map Games
                            </CardTitle>
                            {canManage && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.push(`/org/${slug}/gamelog/${matchId}/maps`)
                                    }
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {match.status === "draft" ? "Manage" : "Edit"} Maps
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {match.maps && match.maps.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Game #</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Map Name</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {match.maps.map((mapGame) => (
                                        <TableRow key={mapGame.id}>
                                            <TableCell>{mapGame.gameIdx}</TableCell>
                                            <TableCell className="font-medium">
                                                {mapGame.title}
                                            </TableCell>
                                            <TableCell>{mapGame.mapName || "N/A"}</TableCell>
                                            <TableCell>
                                                {mapGame.ourScore} - {mapGame.theirScore}
                                            </TableCell>
                                            <TableCell>
                                                {mapGame.durationSec ? (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {Math.floor(mapGame.durationSec / 60)}:
                                                        {String(mapGame.durationSec % 60).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No map games recorded yet</p>
                                {canManage && match.status === "draft" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() =>
                                            router.push(`/org/${slug}/gamelog/${matchId}/maps`)
                                        }
                                    >
                                        Add Map Games
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Player Statistics */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Player Statistics
                            </CardTitle>
                            {canManage && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        router.push(`/org/${slug}/gamelog/${matchId}/stats`)
                                    }
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {match.status === "draft" ? "Manage" : "Edit"} Stats
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {match.playerStats && match.playerStats.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Player</TableHead>
                                        <TableHead className="text-center">K</TableHead>
                                        <TableHead className="text-center">D</TableHead>
                                        <TableHead className="text-center">A</TableHead>
                                        <TableHead className="text-center">K/D</TableHead>
                                        <TableHead className="text-center">Damage</TableHead>
                                        <TableHead className="text-center">Rating</TableHead>
                                        <TableHead className="text-center">MVP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {match.playerStats.map((stat: any) => (
                                        <TableRow key={stat.id}>
                                            <TableCell className="font-medium">
                                                {stat.player?.gamerTag || stat.playerName || "Unknown Player"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.kills ?? stat.kills ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.deaths ?? stat.deaths ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.assists ?? stat.assists ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {(stat.statsJson?.kills || stat.kills) && (stat.statsJson?.deaths || stat.deaths)
                                                    ? ((stat.statsJson?.kills || stat.kills) / (stat.statsJson?.deaths || stat.deaths)).toFixed(2)
                                                    : "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.statsJson?.damage ?? stat.damage ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.rating?.toFixed(2) ?? "-"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stat.isMvp && (
                                                    <Award className="h-4 w-4 text-yellow-500 mx-auto" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No player statistics recorded yet</p>
                                {canManage && match.status === "draft" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() =>
                                            router.push(`/org/${slug}/gamelog/${matchId}/stats`)
                                        }
                                    >
                                        Add Player Stats
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Unapprove Confirmation Dialog */}
            <AlertDialog open={showUnapproveDialog} onOpenChange={setShowUnapproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unapprove Match</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p className="text-sm">
                                    Please provide a reason for unapproving this match. This will change the match status back to &quot;submitted&quot;.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="unapprove-reason">Reason</Label>
                                    <Input
                                        id="unapprove-reason"
                                        value={unapproveReason}
                                        onChange={(e) => setUnapproveReason(e.target.value)}
                                        placeholder="e.g., Incorrect score reported, missing player stats..."
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUnapproveReason("")}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            variant="outline"
                            onClick={handleUnapprove}
                            disabled={!unapproveReason.trim() || unapproveMatch.isPending}
                        >
                            {unapproveMatch.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Unapproving...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Unapprove Match
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    setShowDeleteDialog(open);
                    if (!open) setDeleteConfirmation("");
                }}
            >
                <AlertDialogContent className="max-w-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Permanently Delete Match
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 text-left">
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                                <p className="font-semibold text-destructive">⚠️ Warning: This action cannot be undone!</p>
                                <p className="text-sm">
                                    You are about to permanently delete this match. This will also delete:
                                </p>
                                <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                                    <li>All map game records</li>
                                    <li>All player statistics</li>
                                    <li>Match history and audit trail</li>
                                    <li>Generated reports and exports</li>
                                </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-4 space-y-2">
                                <p className="font-semibold">Match Details:</p>
                                <div className="text-sm space-y-1">
                                    <p><strong>Opponent:</strong> {match?.opponent}</p>
                                    <p><strong>Tournament:</strong> {match?.tournament || "N/A"}</p>
                                    <p><strong>Status:</strong> <Badge variant="secondary" className="ml-1">{match?.status}</Badge></p>
                                    {match?.startedAt && (
                                        <p><strong>Date:</strong> {format(parseISO(match.startedAt), "PPP")}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="delete-confirm" className="font-semibold">
                                    To confirm deletion, type the opponent name: <span className="text-destructive">{match?.opponent}</span>
                                </Label>
                                <Input
                                    id="delete-confirm"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder="Type opponent name exactly"
                                    className="font-mono"
                                />
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmation !== match?.opponent || deleteMatch.isPending}
                        >
                            {deleteMatch.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Permanently Delete
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
