"use client";

import { AppButton } from "@/components/ui/AppButton";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import * as React from "react";

export default function UIProbePage() {
    const [loading, setLoading] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const [showError, setShowError] = React.useState(false);

    const handleLoadingTest = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">UI Components Probe</h1>
            <p className="text-gray-600 mb-8">
                Testing wrapper components for consistent theming and props
            </p>

            <div className="grid gap-8">
                {/* Button Tests */}
                <AppCard>
                    <AppCardHeader>
                        <h2 className="text-xl font-semibold">AppButton Tests</h2>
                    </AppCardHeader>
                    <AppCardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <AppButton variant="default">Default Button</AppButton>
                            <AppButton variant="secondary">Secondary</AppButton>
                            <AppButton variant="outline">Outline</AppButton>
                            <AppButton variant="destructive">Destructive</AppButton>
                            <AppButton variant="ghost">Ghost</AppButton>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <AppButton
                                isLoading={loading}
                                onClick={handleLoadingTest}
                            >
                                {loading ? "Loading..." : "Test Loading"}
                            </AppButton>
                            <AppButton leftIcon={<span>🔥</span>}>
                                With Left Icon
                            </AppButton>
                            <AppButton rightIcon={<span>→</span>}>
                                With Right Icon
                            </AppButton>
                        </div>
                    </AppCardContent>
                </AppCard>

                {/* Input Tests */}
                <AppCard>
                    <AppCardHeader>
                        <h2 className="text-xl font-semibold">AppInput Tests</h2>
                    </AppCardHeader>
                    <AppCardContent className="space-y-4">
                        <AppInput
                            label="Basic Input"
                            placeholder="Enter something..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            helperText="This is helper text"
                        />

                        <AppInput
                            label="Input with Error"
                            placeholder="This has an error"
                            errorText={showError ? "This field is required" : undefined}
                        />

                        <AppButton
                            onClick={() => setShowError(!showError)}
                            variant="outline"
                            size="sm"
                        >
                            Toggle Error State
                        </AppButton>
                    </AppCardContent>
                </AppCard>

                {/* Spinner Tests */}
                <AppCard>
                    <AppCardHeader>
                        <h2 className="text-xl font-semibold">Spinner Tests</h2>
                    </AppCardHeader>
                    <AppCardContent>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <Spinner size="sm" />
                                <p className="text-sm mt-2">Small</p>
                            </div>
                            <div className="text-center">
                                <Spinner size="md" />
                                <p className="text-sm mt-2">Medium</p>
                            </div>
                            <div className="text-center">
                                <Spinner size="lg" />
                                <p className="text-sm mt-2">Large</p>
                            </div>
                        </div>
                    </AppCardContent>
                </AppCard>

                {/* Empty State Tests */}
                <AppCard>
                    <AppCardHeader>
                        <h2 className="text-xl font-semibold">EmptyState Tests</h2>
                    </AppCardHeader>
                    <AppCardContent>
                        <EmptyState
                            icon={<div className="text-4xl">📭</div>}
                            title="No Items Found"
                            description="There are no items to display at the moment. Try adding some content or adjusting your filters."
                            cta={
                                <AppButton>
                                    Add First Item
                                </AppButton>
                            }
                        />
                    </AppCardContent>
                </AppCard>

                {/* Nested Card Test */}
                <AppCard>
                    <AppCardHeader>
                        <h2 className="text-xl font-semibold">Card Nesting Test</h2>
                    </AppCardHeader>
                    <AppCardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AppCard>
                                <AppCardContent className="p-4">
                                    <h3 className="font-medium mb-2">Nested Card 1</h3>
                                    <p className="text-sm text-muted-foreground">
                                        This is a card inside another card.
                                    </p>
                                </AppCardContent>
                            </AppCard>
                            <AppCard>
                                <AppCardContent className="p-4">
                                    <h3 className="font-medium mb-2">Nested Card 2</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Cards can be nested for complex layouts.
                                    </p>
                                </AppCardContent>
                            </AppCard>
                        </div>
                    </AppCardContent>
                </AppCard>
            </div>
        </div>
    );
}