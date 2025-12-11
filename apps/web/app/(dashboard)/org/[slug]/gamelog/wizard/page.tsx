"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { GameLogWizard } from "../components/GameLogWizard";

export default function GameLogWizardPage() {
    const router = useRouter();
    const params = useParams();
    const organizationSlug = params?.slug as string;

    const handleClose = () => {
        router.push(`/org/${organizationSlug}/gamelog`);
    };

    const handleBack = () => {
        router.push(`/org/${organizationSlug}/gamelog`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Game Logs
                        </Button>
                        <div className="h-6 w-px bg-border" />
                        <h1 className="text-xl font-semibold">Log Match - Simple Wizard</h1>
                    </div>
                </div>
            </div>

            {/* Wizard Content */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <GameLogWizard
                    organizationSlug={organizationSlug}
                    onClose={handleClose}
                    onBack={handleBack}
                    fullPage={true}
                />
            </div>
        </div>
    );
}
