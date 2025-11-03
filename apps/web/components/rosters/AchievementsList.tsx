import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useAchievements, useDeleteAchievement } from '@/hooks/rosters';
import { usePermissions } from '@/hooks/usePermissions';
import type { Achievement } from '@/types/roster';
import { format } from 'date-fns';
import { Calendar, Edit, MoreVertical, Plus, Trash2, Trophy } from 'lucide-react';

interface AchievementsListProps {
    teamId?: string;
    playerId?: string;
    slug: string;
    onAdd?: () => void;
    onEdit?: (_achievement: Achievement) => void;
}

export function AchievementsList({
    teamId,
    playerId,
    slug,
    onAdd,
    onEdit
}: AchievementsListProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    const {
        data: achievements,
        isLoading,
        error
    } = useAchievements(slug, { teamId, playerId });

    const deleteAchievement = useDeleteAchievement(slug);

    const handleDelete = async (achievement: Achievement) => {
        if (!canManage) return;

        try {
            await deleteAchievement.mutateAsync({
                achievementId: achievement.id,
                teamId: achievement.teamId,
                playerId: achievement.playerId
            });
        } catch (error) {
            console.error('Failed to delete achievement:', error);
        }
    };

    const getAchievementType = (achievement: Achievement) => {
        if (achievement.teamId && achievement.playerId) return 'Individual';
        if (achievement.teamId) return 'Team';
        if (achievement.playerId) return 'Player';
        return 'General';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Team':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Individual':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Player':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        <p>Failed to load achievements</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Achievements
                        <span className="text-sm font-normal text-muted-foreground">
                            ({achievements?.length || 0})
                        </span>
                    </CardTitle>
                    {canManage && onAdd && (
                        <Button size="sm" onClick={onAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Achievement
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!achievements || achievements.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <div className="text-center">
                            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No achievements yet</p>
                            {canManage && onAdd && (
                                <p className="text-xs mt-1">
                                    Add the first achievement to get started
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {achievements.map((achievement, index) => (
                            <div key={achievement.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-base mb-1">
                                                            {achievement.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={getTypeColor(getAchievementType(achievement))}
                                                            >
                                                                {getAchievementType(achievement)}
                                                            </Badge>
                                                            <div className="flex items-center text-sm text-muted-foreground">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {format(new Date(achievement.date), 'MMM d, yyyy')}
                                                            </div>
                                                        </div>
                                                        {achievement.details && (
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {achievement.details}
                                                            </p>
                                                        )}
                                                        {achievement.eventRef && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Event: {achievement.eventRef}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {canManage && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => onEdit?.(achievement)}
                                                                >
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit Achievement
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(achievement)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Achievement
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {index < achievements.length - 1 && (
                                    <Separator className="mt-4" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}