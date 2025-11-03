"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getServerUrl } from "@/lib/api/config";
import { ArrowLeft, Award, Link as LinkIcon, Unlink, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LinkUserDialog } from "./components/LinkUserDialog";
import { TeamAssignments } from "./components/TeamAssignments";
import { useLinkPlayer } from "./hooks/useLinkPlayer";
import { useOrgUsers } from "./hooks/useOrgUsers";
import { usePlayer } from "./hooks/usePlayer";
import { useUnlinkPlayer } from "./hooks/useUnlinkPlayer";

export default function PlayerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const playerId = params?.playerId as string;
    const { toast } = useToast();

    const [showLinkDialog, setShowLinkDialog] = useState(false);

    const { data: player, isLoading } = usePlayer(slug, playerId);
    const { data: orgUsers = [] } = useOrgUsers(slug);
    const linkPlayerMutation = useLinkPlayer(slug, playerId);
    const unlinkPlayerMutation = useUnlinkPlayer(slug, playerId);

    const handleLinkUser = async (userId: string) => {
        try {
            await linkPlayerMutation.mutateAsync({ userId });
            toast({
                title: "User linked",
                description: "Player profile has been linked to the user account.",
            });
            setShowLinkDialog(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to link user",
                variant: "destructive",
            });
        }
    };

    const handleUnlinkUser = async () => {
        if (!confirm("Are you sure you want to unlink this user?")) return;

        try {
            await unlinkPlayerMutation.mutateAsync();
            toast({
                title: "User unlinked",
                description: "Player profile has been unlinked from the user account.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to unlink user",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Player not found</h3>
                    <p className="text-muted-foreground mb-4">
                        The player you're looking for doesn't exist.
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="sm" asChild className="mt-1">
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {player.avatar ? (
                            <img
                                src={`${getServerUrl()}${player.avatar}`}
                                alt={player.gamerTag}
                                className="w-24 h-24 rounded-lg object-cover border-2 border-border"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center border-2 border-border">
                                <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{player.gamerTag}</h1>
                        <p className="text-muted-foreground">
                            {player.role || 'No role'}
                            {player.rank && ` • ${player.rank}`}
                        </p>
                        {player.realName && (
                            <p className="text-sm text-muted-foreground mt-1">{player.realName}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {player.orgUserId ? (
                        <Button
                            variant="outline"
                            onClick={handleUnlinkUser}
                            disabled={unlinkPlayerMutation.isPending}
                        >
                            <Unlink className="h-4 w-4 mr-2" />
                            Unlink User
                        </Button>
                    ) : (
                        <Button onClick={() => setShowLinkDialog(true)}>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Link User
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={player.isActive ? "default" : "secondary"}>
                            {player.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Linked User</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium">
                            {player.orgUser?.displayName || player.orgUserId ? "Linked" : "Not Linked"}
                        </p>
                        {player.orgUser && (
                            <p className="text-xs text-muted-foreground">{player.orgUser.email}</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Eligibility</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge
                            variant={
                                player.eligibility === 'eligible' ? 'default' :
                                    player.eligibility === 'probation' ? 'secondary' :
                                        'destructive'
                            }
                        >
                            {player.eligibility || 'eligible'}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Teams</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {player.teams?.length || 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Player Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Player Information</CardTitle>
                        <CardDescription>Profile details and contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Gamer Tag</label>
                            <p className="text-lg">{player.gamerTag}</p>
                        </div>

                        {player.role && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <p className="text-lg">{player.role}</p>
                            </div>
                        )}

                        {player.rank && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Rank</label>
                                <p className="text-lg">{player.rank}</p>
                            </div>
                        )}

                        {player.eligibility && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Eligibility</label>
                                <Badge
                                    variant={
                                        player.eligibility === 'eligible' ? 'default' :
                                            player.eligibility === 'probation' ? 'secondary' :
                                                'destructive'
                                    }
                                >
                                    {player.eligibility}
                                </Badge>
                            </div>
                        )}

                        {player.bio && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                <p className="text-sm">{player.bio}</p>
                            </div>
                        )}

                        {player.socialsJson && Object.keys(player.socialsJson).length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Social Links</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(player.socialsJson).map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {platform}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {player.orgUser && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Linked User</label>
                                <p className="text-lg">{player.orgUser.displayName}</p>
                                <p className="text-sm text-muted-foreground">{player.orgUser.email}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Assignments */}
                <TeamAssignments teams={player.teams || []} slug={slug} />

                {/* Player Achievements */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Achievements
                                </CardTitle>
                                <CardDescription>
                                    {player.achievements?.length || 0} achievements
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
                        {!player.achievements || player.achievements.length === 0 ? (
                            <div className="text-center py-8">
                                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No achievements yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {player.achievements.slice(0, 5).map((achievement: any) => (
                                    <div
                                        key={achievement.id}
                                        className="flex items-start gap-3 p-3 border rounded-lg"
                                    >
                                        <Award className="h-5 w-5 text-blue-500 mt-0.5" />
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
            </div>

            {/* Link User Dialog */}
            <LinkUserDialog
                open={showLinkDialog}
                onOpenChange={setShowLinkDialog}
                onSubmit={handleLinkUser}
                orgUsers={orgUsers}
                isLoading={linkPlayerMutation.isPending}
            />
        </div>
    );
}
