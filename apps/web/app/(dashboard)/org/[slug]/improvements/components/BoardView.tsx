'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type {
    ImprovementCategory,
    ImprovementEntry,
    ImprovementPriority
} from '@/types/improvement';
import { Calendar, Lightbulb, TrendingUp, User, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BoardViewProps {
    improvements: ImprovementEntry[];
    orgSlug: string;
    categoryColors: Record<ImprovementCategory, string>;
    categoryLabels: Record<ImprovementCategory, string>;
    priorityColors: Record<ImprovementPriority, string>;
}

export function BoardView({
    improvements,
    orgSlug,
    categoryColors,
    categoryLabels,
    priorityColors,
}: BoardViewProps) {
    const router = useRouter();

    const columns = [
        { id: 'proposed', label: 'Proposed', color: 'bg-gray-50', icon: Lightbulb },
        { id: 'accepted', label: 'Accepted', color: 'bg-blue-50', icon: TrendingUp },
        { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-50', icon: Calendar },
        { id: 'implemented', label: 'Implemented', color: 'bg-green-50', icon: TrendingUp },
    ];

    const getImprovementsByStatus = (status: string) => {
        return improvements.filter(i => i.status === status);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(column => {
                const columnImprovements = getImprovementsByStatus(column.id);
                const Icon = column.icon;

                return (
                    <div key={column.id} className="flex flex-col">
                        {/* Column Header */}
                        <div className={`${column.color} rounded-t-lg border-t border-x p-3`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <h3 className="font-semibold">{column.label}</h3>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {columnImprovements.length}
                                </Badge>
                            </div>
                        </div>

                        {/* Column Content */}
                        <div className="border-x border-b rounded-b-lg p-2 bg-muted/20 min-h-[500px] space-y-2">
                            {columnImprovements.map(improvement => (
                                <Card
                                    key={improvement.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                                    onClick={() =>
                                        router.push(`/org/${orgSlug}/improvements/${improvement.id}`)
                                    }
                                >
                                    <CardHeader className="pb-3">
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                                                    {improvement.title}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className={`${priorityColors[improvement.priority]} text-xs shrink-0`}
                                                >
                                                    {improvement.priority}
                                                </Badge>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`${categoryColors[improvement.category]} text-xs w-fit`}
                                            >
                                                {categoryLabels[improvement.category]}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-2">
                                        {improvement.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {improvement.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                                            {improvement.vodUrl && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Video className="w-3 h-3" />
                                                    <span>VOD</span>
                                                </div>
                                            )}
                                            {improvement.reporter && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <User className="w-3 h-3" />
                                                    <span className="truncate max-w-[100px]">
                                                        {improvement.reporter.displayName}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(improvement.createdAt)}</span>
                                            </div>
                                        </div>

                                        {improvement.tags && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {improvement.tags.split(',').slice(0, 2).map((tag, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-xs px-1.5 py-0"
                                                    >
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {columnImprovements.length === 0 && (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No items
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
