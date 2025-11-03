'use client';

import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RunsheetTemplate } from '@/types/runsheet-template-full';
import { Clock } from 'lucide-react';

interface ViewTemplateDialogProps {
    template: RunsheetTemplate;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewTemplateDialog({ template, open, onOpenChange }: ViewTemplateDialogProps) {
    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getPriorityBadge = (priority?: string) => {
        if (!priority) return null;
        const variants: Record<string, string> = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30',
            normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30',
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/30',
        };
        return (
            <Badge className={variants[priority] || variants.normal}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const getTotalDuration = () => {
        return template.items.reduce((sum, item) => sum + item.durationMs, 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{template.name}</DialogTitle>
                    {template.description && (
                        <DialogDescription>{template.description}</DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2 border-b">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Total Duration: {formatDuration(getTotalDuration())}</span>
                        </div>
                        <span>•</span>
                        <span>{template.items.length} items</span>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Template Items</h3>
                        <div className="space-y-2">
                            {template.items.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No items in this template
                                </p>
                            ) : (
                                template.items.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="text-sm font-medium text-muted-foreground mt-0.5">
                                                    {index + 1}.
                                                </span>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium">{item.title}</span>
                                                        {item.type && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.type}
                                                            </Badge>
                                                        )}
                                                        {item.priority && getPriorityBadge(item.priority)}
                                                    </div>
                                                    {item.notes && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatDuration(item.durationMs)}</span>
                                            </div>
                                        </div>

                                        {(item.location || item.equipment) && (
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                                                {item.location && <span>📍 {item.location}</span>}
                                                {item.equipment && <span>🔧 {item.equipment}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
