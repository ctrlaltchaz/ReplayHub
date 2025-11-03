import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpsertAvailability } from '@/hooks/rosters';
import { usePermissions } from '@/hooks/usePermissions';
import type { SetAvailabilityDto } from '@/types/roster';
import { format } from 'date-fns';
import { Calendar, Check, Clock, X } from 'lucide-react';
import React, { useState } from 'react';

interface AvailabilityEditorProps {
    playerId: string;
    date: Date;
    slug: string;
    currentStatus?: 'available' | 'unsure' | 'unavailable';
    currentNote?: string;
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

const statusOptions = [
    {
        value: 'available' as const,
        label: 'Available',
        description: 'I can participate',
        icon: <Check className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200'
    },
    {
        value: 'unsure' as const,
        label: 'Maybe',
        description: 'I might be able to participate',
        icon: <Clock className="h-4 w-4" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200'
    },
    {
        value: 'unavailable' as const,
        label: 'Unavailable',
        description: 'I cannot participate',
        icon: <X className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
    }
];

export function AvailabilityEditor({
    playerId,
    date,
    slug,
    currentStatus,
    currentNote = '',
    trigger,
    onSuccess
}: AvailabilityEditorProps) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('roster.manage');

    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'available' | 'unsure' | 'unavailable'>(
        currentStatus || 'available'
    );
    const [note, setNote] = useState(currentNote);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const upsertAvailability = useUpsertAvailability(slug, playerId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canEdit) return;

        setIsSubmitting(true);
        try {
            const data: SetAvailabilityDto = {
                date: format(date, 'yyyy-MM-dd'),
                status,
                note: note.trim() || undefined
            };

            await upsertAvailability.mutateAsync(data);
            setIsOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Failed to update availability:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setStatus(currentStatus || 'available');
        setNote(currentNote);
    };

    if (!canEdit) {
        return null;
    }

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Set Availability
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Set Availability
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {format(date, 'EEEE, MMMM d, yyyy')}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Availability Status
                        </Label>
                        <div className="space-y-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={`
                                        w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors text-left
                                        ${status === option.value
                                            ? `${option.bgColor} border-current ${option.color}`
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === option.value
                                        ? `border-current ${option.color}`
                                        : 'border-gray-300'
                                        }`}>
                                        {status === option.value && (
                                            <div className={`w-2 h-2 rounded-full ${option.value === 'available' ? 'bg-green-600' :
                                                option.value === 'unsure' ? 'bg-yellow-600' : 'bg-red-600'
                                                }`} />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className={status === option.value ? option.color : 'text-gray-400'}>
                                            {option.icon}
                                        </div>
                                        <div>
                                            <div className={`font-medium ${status === option.value ? option.color : ''
                                                }`}>
                                                {option.label}
                                            </div>
                                            <p className={`text-xs ${status === option.value
                                                ? option.color
                                                : 'text-muted-foreground'
                                                }`}>
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <Label htmlFor="note" className="text-sm font-medium">
                            Note (optional)
                        </Label>
                        <Textarea
                            id="note"
                            placeholder="Add any additional details about your availability..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                resetForm();
                                setIsOpen(false);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-w-[100px]"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </div>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}