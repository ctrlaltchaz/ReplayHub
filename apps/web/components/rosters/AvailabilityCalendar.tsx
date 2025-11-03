import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayerAvailability, useTeamAvailability } from '@/hooks/rosters';
import { usePermissions } from '@/hooks/usePermissions';
import {
    addWeeks,
    eachDayOfInterval,
    endOfWeek,
    format,
    isToday,
    parseISO,
    startOfWeek,
    subWeeks
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useState } from 'react';

interface AvailabilityCalendarProps {
    teamId?: string;
    playerId?: string;
    slug: string;
    onDateSelect?: (_date: Date) => void;
    onEdit?: (_date: Date) => void;
}

interface DayAvailability {
    date: Date;
    available: number;
    unsure: number;
    unavailable: number;
    total: number;
    playerStatus?: 'available' | 'unsure' | 'unavailable';
}

export function AvailabilityCalendar({
    teamId,
    playerId,
    slug,
    onDateSelect,
    onEdit
}: AvailabilityCalendarProps) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('roster.manage');

    const [currentWeek, setCurrentWeek] = useState(new Date());

    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Fetch availability for the current week
    const { data: teamAvailability } = useTeamAvailability(slug, {
        date: format(weekStart, 'yyyy-MM-dd'),
        teamId
    });

    const { data: playerAvailability } = usePlayerAvailability(
        slug,
        playerId || '',
        format(weekStart, 'yyyy-MM-dd')
    );

    const getStatusColor = (status: 'available' | 'unsure' | 'unavailable') => {
        switch (status) {
            case 'available':
                return 'bg-green-500';
            case 'unsure':
                return 'bg-yellow-500';
            case 'unavailable':
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getStatusLabel = (status: 'available' | 'unsure' | 'unavailable') => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'unsure':
                return 'Maybe';
            case 'unavailable':
                return 'Unavailable';
            default:
                return 'Unknown';
        }
    };

    const calculateDayAvailability = (date: Date): DayAvailability => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayAvailability = teamAvailability?.filter(a =>
            format(parseISO(a.date), 'yyyy-MM-dd') === dateStr
        ) || [];

        const available = dayAvailability.filter(a => a.status === 'available').length;
        const unsure = dayAvailability.filter(a => a.status === 'unsure').length;
        const unavailable = dayAvailability.filter(a => a.status === 'unavailable').length;
        const total = dayAvailability.length;

        // Get player-specific status if viewing individual player
        const playerStatus = playerId
            ? playerAvailability?.find(a =>
                format(parseISO(a.date), 'yyyy-MM-dd') === dateStr
            )?.status
            : undefined;

        return {
            date,
            available,
            unsure,
            unavailable,
            total,
            playerStatus
        };
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentWeek(prev =>
            direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
        );
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Availability Calendar
                        {playerId && (
                            <Badge variant="secondary" className="ml-2">
                                Player View
                            </Badge>
                        )}
                        {teamId && !playerId && (
                            <Badge variant="secondary" className="ml-2">
                                Team View
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {weekDays.map((date) => {
                        const dayAvailability = calculateDayAvailability(date);
                        const isCurrentDay = isToday(date);

                        return (
                            <div
                                key={date.toISOString()}
                                className={`
                                    relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors
                                    ${isCurrentDay ? 'ring-2 ring-primary' : ''}
                                    hover:bg-muted/50
                                `}
                                onClick={() => onDateSelect?.(date)}
                            >
                                <div className="text-sm font-medium mb-1">
                                    {format(date, 'd')}
                                </div>

                                {playerId ? (
                                    // Player-specific view
                                    <div className="space-y-1">
                                        {dayAvailability.playerStatus ? (
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${getStatusColor(dayAvailability.playerStatus)
                                                        }`}
                                                />
                                                <span className="text-xs">
                                                    {getStatusLabel(dayAvailability.playerStatus)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">
                                                Not set
                                            </div>
                                        )}
                                        {canManage && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit?.(date);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    // Team overview
                                    <div className="space-y-1">
                                        {dayAvailability.total > 0 ? (
                                            <>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Users className="h-3 w-3" />
                                                    {dayAvailability.total}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayAvailability.available > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                                            <span className="text-xs">{dayAvailability.available}</span>
                                                        </div>
                                                    )}
                                                    {dayAvailability.unsure > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                            <span className="text-xs">{dayAvailability.unsure}</span>
                                                        </div>
                                                    )}
                                                    {dayAvailability.unavailable > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                                            <span className="text-xs">{dayAvailability.unavailable}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-muted-foreground">
                                                No data
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Legend:</div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>Maybe</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Unavailable</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}