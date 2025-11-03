"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import type { UpdateTeamDto } from "@/types/roster";
import { pdf } from "@react-pdf/renderer";
import { ArrowLeft, Award, Download, Plus, Settings, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { TeamEditDialog } from "../../components/TeamEditDialog";
import { usePlayersList } from "../../hooks/usePlayersList";
import { useUpdateTeam } from "../../hooks/useUpdateTeam";
import { AddMemberDialog } from "./components/AddMemberDialog";
import { RosterSheetPDF } from "./components/RosterSheetPDF";
import { useAddTeamMember } from "./hooks/useAddTeamMember";
import { useRemoveTeamMember } from "./hooks/useRemoveTeamMember";
import { useTeam } from "./hooks/useTeam";
import { useUpdateTeamMember } from "./hooks/useUpdateTeamMember";

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const teamId = params?.teamId as string;
    const { toast } = useToast();

    const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
    const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);
    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    // Fetch team data
    const { data: team, isLoading } = useTeam(slug, teamId);
    const { data: players = [] } = usePlayersList(slug, {});

    // Mutations
    const addMemberMutation = useAddTeamMember(slug, teamId);
    const removeMemberMutation = useRemoveTeamMember(slug, teamId);
    const updateMemberMutation = useUpdateTeamMember(slug, teamId);
    const updateTeamMutation = useUpdateTeam(slug, teamId);

    const handleAddMember = async (data: { playerId: string; isStarter?: boolean; position?: string }) => {
        try {
            await addMemberMutation.mutateAsync(data);
            toast({
                title: "Member added",
                description: "Player has been added to the team.",
            });
            setShowAddMemberDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add member",
                variant: "destructive",
            });
        }
    };

    const handleRemoveMember = async (playerId: string, playerName: string) => {
        if (!confirm(`Remove ${playerName} from this team?`)) return;

        setRemovingMemberId(playerId);
        try {
            await removeMemberMutation.mutateAsync(playerId);
            toast({
                title: "Member removed",
                description: `${playerName} has been removed from the team.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to remove member",
                variant: "destructive",
            });
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleToggleStarter = async (playerId: string, currentStatus: boolean) => {
        try {
            await updateMemberMutation.mutateAsync({
                playerId,
                isStarter: !currentStatus,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update member",
                variant: "destructive",
            });
        }
    };

    const handleUpdateTeam = async (data: UpdateTeamDto) => {
        try {
            await updateTeamMutation.mutateAsync(data);
            toast({
                title: "Team updated",
                description: "Team information has been updated.",
            });
            setShowEditTeamDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update team",
                variant: "destructive",
            });
        }
    };

    const handleExportRoster = async () => {
        if (!team) return;

        try {
            const blob = await pdf(
                <RosterSheetPDF
                    team={team}
                    organizationName={slug || "Organization"}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${team.name.replace(/\s+/g, '_')}_Roster_${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Roster exported",
                description: "Roster sheet has been downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: error instanceof Error ? error.message : "Failed to export roster",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Team not found</h2>
                    <p className="text-muted-foreground mb-4">
                        The team you're looking for doesn't exist.
                    </p>
                    <Button asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rosters
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const members = team.members || [];
    const starters = members.filter((m: any) => m.isStarter);
    const bench = members.filter((m: any) => !m.isStarter);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                            {team.captain && (
                                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Captain: {team.captain.gamerTag}
                                </span>
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            {team.game}
                            {team.season && ` • ${team.season}`}
                            {" • "}
                            <span className={team.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                                {team.status}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportRoster}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Roster
                    </Button>
                    <Button variant="outline" onClick={() => setShowEditTeamDialog(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{members.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current Players
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{starters.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Subs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bench.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Roster */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Team Roster</CardTitle>
                            <CardDescription>
                                Manage team members and their positions
                            </CardDescription>
                        </div>
                        <Button onClick={() => setShowAddMemberDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {members.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Add players to build your team roster
                            </p>
                            <Button onClick={() => setShowAddMemberDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Member
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Current Players */}
                            {starters.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                        CURRENT PLAYERS
                                    </h3>
                                    <div className="space-y-2">
                                        {starters.map((member: any) => (
                                            <div
                                                key={member.playerId}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-semibold">
                                                            {member.player?.gamerTag?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/org/${slug}/rosters/players/${member.playerId}`}
                                                            className="font-semibold hover:underline"
                                                        >
                                                            {member.player?.gamerTag}
                                                        </Link>
                                                        {member.position && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {member.position}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStarter(member.playerId, true)}
                                                    >
                                                        Move to Subs
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.playerId,
                                                                member.player?.gamerTag
                                                            )
                                                        }
                                                        disabled={removingMemberId === member.playerId}
                                                    >
                                                        <UserMinus className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subs (Substitutes) */}
                            {bench.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                                        SUBS (SUBSTITUTES)
                                    </h3>
                                    <div className="space-y-2">
                                        {bench.map((member: any) => (
                                            <div
                                                key={member.playerId}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <span className="text-sm font-semibold">
                                                            {member.player?.gamerTag?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/org/${slug}/rosters/players/${member.playerId}`}
                                                            className="font-semibold hover:underline"
                                                        >
                                                            {member.player?.gamerTag}
                                                        </Link>
                                                        {member.position && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {member.position}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleStarter(member.playerId, false)}
                                                    >
                                                        Promote to Current Player
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.playerId,
                                                                member.player?.gamerTag
                                                            )
                                                        }
                                                        disabled={removingMemberId === member.playerId}
                                                    >
                                                        <UserMinus className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Team Achievements */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Achievements
                            </CardTitle>
                            <CardDescription>
                                {team?.achievements?.length || 0} team achievements
                            </CardDescription>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/org/${slug}/rosters/achievements`}>
                                View All
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!team?.achievements || team.achievements.length === 0 ? (
                        <div className="text-center py-8">
                            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No achievements yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {team.achievements.slice(0, 5).map((achievement: any) => (
                                <div
                                    key={achievement.id}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                >
                                    <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{achievement.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(achievement.date).toLocaleDateString()}
                                            {achievement.eventRef && ` • ${achievement.eventRef}`}
                                        </p>
                                        {achievement.details && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {achievement.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Member Dialog */}
            <AddMemberDialog
                open={showAddMemberDialog}
                onOpenChange={setShowAddMemberDialog}
                onSubmit={handleAddMember}
                isLoading={addMemberMutation.isPending}
                teamId={teamId}
                slug={slug}
                existingMemberIds={members.map((m: any) => m.playerId)}
            />

            {/* Edit Team Dialog */}
            <TeamEditDialog
                open={showEditTeamDialog}
                onOpenChange={setShowEditTeamDialog}
                onSubmit={handleUpdateTeam}
                isLoading={updateTeamMutation.isPending}
                team={team}
                players={players.map(p => ({ id: p.id, gamerTag: p.gamerTag, realName: p.realName }))}
            />
        </div>
    );
}
