"use client";

import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                    Question {currentStep} of {totalSteps}
                </span>
                <span className="text-muted-foreground">
                    {Math.round(progress)}% Complete
                </span>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Step indicators for major milestones */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    {currentStep > 4 ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                        <div className={`h-2 w-2 rounded-full ${currentStep <= 4 ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                    <span className={currentStep <= 4 ? 'text-foreground font-medium' : ''}>
                        Match Basics
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    {currentStep > 4 && currentStep <= totalSteps - 1 ? (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : currentStep > totalSteps - 1 ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                        <div className="h-2 w-2 rounded-full bg-muted" />
                    )}
                    <span className={currentStep > 4 && currentStep <= totalSteps - 1 ? 'text-foreground font-medium' : ''}>
                        Details
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    {currentStep === totalSteps ? (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : (
                        <div className="h-2 w-2 rounded-full bg-muted" />
                    )}
                    <span className={currentStep === totalSteps ? 'text-foreground font-medium' : ''}>
                        Review
                    </span>
                </div>
            </div>
        </div>
    );
}
