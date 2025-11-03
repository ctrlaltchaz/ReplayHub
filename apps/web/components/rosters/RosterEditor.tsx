import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoster } from '@/hooks/rosters';
import { usePermissions } from '@/hooks/usePermissions';
import type { Team, TeamMember } from '@/types/roster';
import { Crown, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerCard } from './PlayerCard';

interface RosterEditorProps {
    team: Team;
    slug: string;
    onAddPlayer?: () => void;
}

interface RosterSection {
    id: string;
    title: string;
    members: TeamMember[];
    icon: React.ReactNode;
}

export function RosterEditor({ team, slug, onAddPlayer }: RosterEditorProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    const { updateMember, removeMember } = useRoster(slug, team.id);
    const [isUpdating, setIsUpdating] = useState(false);

    // Separate starters and bench players
    const starters = team.members?.filter(m => m.isStarter) || [];
    const bench = team.members?.filter(m => !m.isStarter) || [];

    const sections: RosterSection[] = [
        {
            id: 'starters',
            title: 'Starting Lineup',
            members: starters,
            icon: <Crown className="h-4 w-4" />
        },
        {
            id: 'bench',
            title: 'Bench',
            members: bench,
            icon: <Users className="h-4 w-4" />
        }
    ];

    const handleRemovePlayer = async (member: TeamMember) => {
        if (!canManage || !member.player) return;

        setIsUpdating(true);
        try {
            const removeMutation = removeMember(member.player.id);
            await removeMutation.mutateAsync();
        } catch (error) {
            console.error('Failed to remove player:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePromotePlayer = async (member: TeamMember) => {
        if (!canManage || !member.player) return;

        setIsUpdating(true);
        try {
            const updateMutation = updateMember(member.player.id);
            await updateMutation.mutateAsync({
                isStarter: true,
                position: member.position
            });
        } catch (error) {
            console.error('Failed to promote player:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBenchPlayer = async (member: TeamMember) => {
        if (!canManage || !member.player) return;

        setIsUpdating(true);
        try {
            const updateMutation = updateMember(member.player.id);
            await updateMutation.mutateAsync({
                isStarter: false,
                position: member.position
            });
        } catch (error) {
            console.error('Failed to bench player:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Team Roster</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your team&apos;s starting lineup and bench players
                    </p>
                </div>
                {canManage && (
                    <Button onClick={onAddPlayer}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Player
                    </Button>
                )}
            </div>

            {/* Roster Editor */}
            <div className="grid gap-6 lg:grid-cols-2">
                {sections.map((section) => (
                    <Card key={section.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {section.icon}
                                {section.title}
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({section.members.length})
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[200px] space-y-3">
                                {section.members.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <div className="text-center">
                                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                {section.id === 'starters'
                                                    ? 'No starting players'
                                                    : 'No bench players'
                                                }
                                            </p>
                                            {canManage && (
                                                <p className="text-xs mt-1">
                                                    Add players using the button above
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    section.members.map((member) => (
                                        <div key={member.id} className={isUpdating ? 'opacity-50' : ''}>
                                            {member.player && (
                                                <PlayerCard
                                                    player={member.player}
                                                    teamMember={member}
                                                    slug={slug}
                                                    onRemove={() => handleRemovePlayer(member)}
                                                    onPromote={() => handlePromotePlayer(member)}
                                                    onBench={() => handleBenchPlayer(member)}
                                                />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Instructions */}
            {canManage && (
                <Card className="bg-muted/30">
                    <CardContent className="pt-4">
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-2">Roster Management Tips:</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Use the dropdown menu on each player card to move between lineup and bench</li>
                                <li>Promote bench players to starters or move starters to bench</li>
                                <li>Remove players from the team entirely if needed</li>
                                <li>Add new players using the &quot;Add Player&quot; button above</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}