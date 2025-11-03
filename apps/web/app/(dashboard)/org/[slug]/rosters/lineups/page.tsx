"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTeamsList } from "../hooks/useTeamsList";
import { CreateLineupDialog } from "./components/CreateLineupDialog";
import { useCreateLineup } from "./hooks/useCreateLineup";
import { useDeleteLineup } from "./hooks/useDeleteLineup";
import { useEventsList } from "./hooks/useEventsList";
import { useLineupsList } from "./hooks/useLineupsList";

export default function LineupsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const router = useRouter();
    const { toast } = useToast();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState("");

    const { data: lineups = [], isLoading } = useLineupsList(slug);
    const { data: events = [] } = useEventsList(slug);
    const { data: teams = [] } = useTeamsList(slug);

    const createLineupMutation = useCreateLineup(slug, selectedEventId);
    const deleteLineupMutation = useDeleteLineup(slug);

    const [lineupToDelete, setLineupToDelete] = useState<any>(null);

    const handleCreateLineup = async (data: { eventId: string; teamId: string; title?: string }) => {
        setSelectedEventId(data.eventId);
        try {
            const result = await createLineupMutation.mutateAsync({
                teamId: data.teamId,
                title: data.title,
            });
            toast({
                title: "Lineup created",
                description: "Your lineup has been created successfully.",
            });
            setShowCreateDialog(false);
            // Navigate to the new lineup
            router.push(`/org/${slug}/rosters/lineups/${(result as any).id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create lineup",
                variant: "destructive",
            });
        }
    };

    const handleDeleteLineup = async () => {
        if (!lineupToDelete) return;
        try {
            await deleteLineupMutation.mutateAsync(lineupToDelete.id);
            toast({
                title: "Lineup deleted",
                description: "The lineup has been deleted successfully.",
            });
            setLineupToDelete(null);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete lineup",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rosters
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Lineups</h1>
                        <p className="text-muted-foreground">
                            Manage team lineups for events and matches
                        </p>
                    </div>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lineup
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Event Lineups</CardTitle>
                    <CardDescription>
                        View and manage player lineups for events
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    ) : lineups.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No lineups yet</h3>
                            <p className="text-muted-foreground mb-4">
                                {events.length === 0
                                    ? "Create an event first to build lineups for it."
                                    : "Create a lineup for one of your upcoming events."}
                            </p>
                            {events.length === 0 ? (
                                <Button asChild>
                                    <Link href={`/org/${slug}/events`}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Go to Events
                                    </Link>
                                </Button>
                            ) : (
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Lineup
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lineups.map((lineup: any) => (
                                <div
                                    key={lineup.id}
                                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/org/${slug}/rosters/lineups/${lineup.id}`}
                                            className="flex-1"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">
                                                        {lineup.title || `Lineup for Event ${lineup.eventId.slice(0, 8)}`}
                                                    </h3>
                                                    {lineup.published ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                            <Clock className="h-3 w-3" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {lineup.team.name} • {lineup.team.game}
                                                </p>
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{lineup._count.slots} players</span>
                                            </div>
                                            {!lineup.published && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setLineupToDelete(lineup);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateLineupDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSubmit={handleCreateLineup}
                isLoading={createLineupMutation.isPending}
                events={events}
                teams={teams}
            />

            {/* Delete Confirmation Dialog */}
            {lineupToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setLineupToDelete(null)}>
                    <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Trash2 className="h-5 w-5" />
                                Delete Lineup?
                            </CardTitle>
                            <CardDescription>
                                This will permanently delete this lineup and all player slots. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-semibold">{lineupToDelete.title || 'Lineup'}</p>
                                <p className="text-sm text-muted-foreground">{lineupToDelete.team.name} • {lineupToDelete.team.game}</p>
                                <p className="text-sm text-muted-foreground mt-1">{lineupToDelete._count.slots} player slots</p>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setLineupToDelete(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteLineup}
                                    disabled={deleteLineupMutation.isPending}
                                >
                                    {deleteLineupMutation.isPending ? "Deleting..." : "Delete Lineup"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
