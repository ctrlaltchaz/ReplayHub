"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMember } from "@/types/roster";
import { Users } from "lucide-react";
import Link from "next/link";

interface TeamAssignmentsProps {
    teams: TeamMember[];
    slug: string;
}

export function TeamAssignments({ teams, slug }: TeamAssignmentsProps) {
    if (!teams || teams.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Team Assignments</CardTitle>
                    <CardDescription>Teams this player belongs to</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Not assigned to any teams</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Assignments</CardTitle>
                <CardDescription>
                    {teams.length} {teams.length === 1 ? 'team' : 'teams'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {teams.map((assignment) => (
                        <Link
                            key={assignment.id}
                            href={`/org/${slug}/rosters/teams/${assignment.teamId}`}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors block"
                        >
                            <div>
                                <p className="font-medium">{assignment.team?.name || 'Unknown Team'}</p>
                                <p className="text-sm text-muted-foreground">
                                    {assignment.position || 'No position'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {assignment.isStarter && (
                                    <Badge variant="default">Starter</Badge>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
