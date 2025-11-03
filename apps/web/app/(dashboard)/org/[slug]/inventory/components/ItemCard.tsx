'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryItem } from '@/types/inventory';
import { Calendar, MapPin, Move, Pencil, Tag as TagIcon, Trash2 } from 'lucide-react';

interface ItemCardProps {
    item: InventoryItem;
    onClick?: () => void;
    onEdit?: () => void;
    onMove?: () => void;
    onBook?: () => void;
    onDelete?: () => void;
}

const statusColors = {
    available: 'bg-green-500',
    booked: 'bg-yellow-500',
    out: 'bg-blue-500',
    maintenance: 'bg-orange-500',
};

const conditionColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    repair: 'bg-orange-100 text-orange-800 border-orange-200',
    lost: 'bg-red-100 text-red-800 border-red-200',
};

export function ItemCard({ item, onClick, onEdit, onMove, onBook, onDelete }: ItemCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle
                            className="text-lg cursor-pointer hover:underline"
                            onClick={onClick}
                        >
                            {item.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize text-xs">
                                {item.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        {item.status === 'available' && onBook && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBook();
                                }}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMove?.();
                            }}
                        >
                            <Move className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent
                className="space-y-3 cursor-pointer"
                onClick={onClick}
            >
                <div className="flex items-center gap-2">
                    <TagIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-mono">{item.tag}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {item.type}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${conditionColors[item.condition]}`}>
                        {item.condition}
                    </Badge>
                </div>

                {item.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{item.location}</span>
                    </div>
                )}

                {item.serial && (
                    <div className="text-xs text-muted-foreground">
                        S/N: <span className="font-mono">{item.serial}</span>
                    </div>
                )}

                {item.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
                )}
            </CardContent>
        </Card>
    );
}
