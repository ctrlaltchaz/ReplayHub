import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import type { Player, TeamMember } from '@/types/roster';
import { Crown, Edit, MoreVertical, Trash2, Trophy } from 'lucide-react';
import Link from 'next/link';

interface PlayerCardProps {
    player: Player;
    teamMember?: TeamMember;
    slug: string;
    onEdit?: () => void;
    onRemove?: () => void;
    onPromote?: () => void;
    onBench?: () => void;
}

export function PlayerCard({
    player,
    teamMember,
    slug,
    onEdit,
    onRemove,
    onPromote,
    onBench
}: PlayerCardProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase();
    };

    const getRoleColor = (role?: string) => {
        switch (role?.toLowerCase()) {
            case 'captain':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'igl':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'support':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'entry':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'awp':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={player.globalUser?.name} alt={player.globalUser?.name || player.gamerTag} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                {getInitials(player.globalUser?.name || player.gamerTag)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">{player.globalUser?.name || player.gamerTag}</h3>
                                {teamMember?.isStarter && (
                                    <Crown className="h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {player.gamerTag}
                            </p>
                        </div>
                    </div>

                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Player
                                </DropdownMenuItem>
                                {teamMember && (
                                    <>
                                        <DropdownMenuSeparator />
                                        {teamMember.isStarter ? (
                                            <DropdownMenuItem onClick={onBench}>
                                                Move to Bench
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={onPromote}>
                                                Promote to Starter
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={onRemove}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove from Team
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Role and Position */}
                <div className="flex items-center gap-2 flex-wrap">
                    {player.role && (
                        <Badge
                            variant="outline"
                            className={getRoleColor(player.role)}
                        >
                            {player.role}
                        </Badge>
                    )}
                    {teamMember?.position && (
                        <Badge variant="secondary">
                            {teamMember.position}
                        </Badge>
                    )}
                    {player.mainsJson && player.mainsJson.length > 0 && (
                        <Badge variant="outline">
                            {player.mainsJson[0]}
                        </Badge>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Rank:</span>
                        <div className="font-medium">{player.rank || 'Unranked'}</div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Achievements:</span>
                        <div className="font-medium flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {player.achievements?.length || 0}
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                {(player.globalUser?.email || player.socialsJson?.discord) && (
                    <div className="text-sm text-muted-foreground">
                        {player.globalUser?.email && (
                            <div>Email: {player.globalUser.email}</div>
                        )}
                        {player.socialsJson?.discord && (
                            <div>Discord: {player.socialsJson.discord}</div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/org/${slug}/rosters/players/${player.id}`}>
                            View Profile
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}