"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface DateTimeQuestionProps {
    value?: string; // ISO date string
    onChange: (value: string) => void;
    label?: string;
    description?: string;
    showTime?: boolean;
}

export function DateTimeQuestion({
    value,
    onChange,
    label,
    description,
    showTime = true,
}: DateTimeQuestionProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        if (value) {
            const dateObj = new Date(value);
            const localDate = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            const localTime = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            }); // HH:MM format

            setDate(localDate);
            setTime(localTime);
        } else {
            // Default to current date/time
            const now = new Date();
            const localDate = now.toLocaleDateString('en-CA');
            const localTime = now.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            });

            setDate(localDate);
            setTime(localTime);

            // Set initial value
            onChange(now.toISOString());
        }
    }, []);

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        updateDateTime(newDate, time);
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);
        updateDateTime(date, newTime);
    };

    const updateDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr) return;

        const dateTimeStr = showTime && timeStr
            ? `${dateStr}T${timeStr}:00`
            : `${dateStr}T00:00:00`;

        const dateObj = new Date(dateTimeStr);
        onChange(dateObj.toISOString());
    };

    const handleUseNow = () => {
        const now = new Date();
        const localDate = now.toLocaleDateString('en-CA');
        const localTime = now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });

        setDate(localDate);
        setTime(localTime);
        onChange(now.toISOString());
    };

    const handleToday = () => {
        const now = new Date();
        const localDate = now.toLocaleDateString('en-CA');

        setDate(localDate);
        updateDateTime(localDate, time);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            {label && (
                <Label className="text-base font-medium">
                    {label}
                </Label>
            )}

            {description && (
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Input */}
                <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Date
                    </Label>
                    <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="text-lg h-12"
                        max={new Date().toISOString().split('T')[0]} // Can't select future dates
                    />
                </div>

                {/* Time Input */}
                {showTime && (
                    <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm">
                            <Clock className="inline h-4 w-4 mr-2" />
                            Time
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="text-lg h-12"
                        />
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                >
                    Today
                </Button>
                {showTime && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseNow}
                    >
                        Use Current Time
                    </Button>
                )}
            </div>

            {/* Preview */}
            {date && (
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                    <p className="font-medium">
                        {new Date(`${date}${showTime && time ? `T${time}` : 'T00:00'}`).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: showTime ? '2-digit' : undefined,
                            minute: showTime ? '2-digit' : undefined,
                        })}
                    </p>
                </div>
            )}
        </div>
    );
}
