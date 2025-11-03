'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { InventoryMovement } from '@/types/inventory';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, MapPin } from 'lucide-react';

interface MovementTimelineProps {
    movements: InventoryMovement[];
}

export function MovementTimeline({ movements }: MovementTimelineProps) {
    if (movements.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No movement history yet</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Movement History</CardTitle>
                <CardDescription>Track of location changes over time</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {movements.map((movement, index) => (
                        <div key={movement.id} className="flex gap-4">
                            {/* Timeline indicator */}
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                {index < movements.length - 1 && <div className="w-0.5 h-full bg-border mt-1" />}
                            </div>

                            {/* Movement details */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    {movement.fromLoc && (
                                        <>
                                            <span className="text-sm font-medium text-muted-foreground">{movement.fromLoc}</span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        </>
                                    )}
                                    <span className="text-sm font-medium">{movement.toLoc || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatDistanceToNow(new Date(movement.at), { addSuffix: true })}</span>
                                    {movement.byUser && (
                                        <>
                                            <span>•</span>
                                            <span>by {movement.byUser.name || movement.byUser.email}</span>
                                        </>
                                    )}
                                </div>
                                {movement.note && (
                                    <p className="text-sm mt-2 px-3 py-2 bg-muted rounded-md italic">
                                        "{movement.note}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
