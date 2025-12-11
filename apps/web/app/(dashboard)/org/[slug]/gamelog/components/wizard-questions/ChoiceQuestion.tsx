"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

interface Choice {
    value: any;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

interface ChoiceQuestionProps {
    value?: any;
    onChange: (value: any) => void;
    choices: Choice[];
    label?: string;
    description?: string;
    columns?: 1 | 2 | 3;
}

export function ChoiceQuestion({
    value,
    onChange,
    choices,
    label,
    description,
    columns = 3,
}: ChoiceQuestionProps) {
    const gridColsClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
    }[columns];

    return (
        <div className="space-y-6">
            {label && (
                <h3 className="text-base font-medium">
                    {label}
                </h3>
            )}

            {description && (
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            <div className={`grid ${gridColsClass} gap-4`}>
                {choices.map((choice) => {
                    const isSelected = value === choice.value;

                    return (
                        <Card
                            key={String(choice.value)}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected
                                    ? "border-primary border-2 shadow-md bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                            onClick={() => onChange(choice.value)}
                        >
                            <CardContent className="p-6 text-center space-y-4">
                                {/* Icon */}
                                {choice.icon && (
                                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        {choice.icon}
                                    </div>
                                )}

                                {/* Label */}
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold">{choice.label}</h4>
                                    {choice.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {choice.description}
                                        </p>
                                    )}
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Keyboard hint */}
            <div className="text-xs text-muted-foreground text-center">
                💡 Tip: Click a card to select, then press Next to continue
            </div>
        </div>
    );
}
