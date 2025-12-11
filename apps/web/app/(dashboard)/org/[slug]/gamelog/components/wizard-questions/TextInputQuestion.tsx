"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

interface TextInputQuestionProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    description?: string;
    autoFocus?: boolean;
    maxLength?: number;
    minLength?: number;
    validation?: (value: string) => string | null; // Returns error message or null
}

export function TextInputQuestion({
    value = "",
    onChange,
    placeholder = "Enter your answer...",
    label,
    description,
    autoFocus = true,
    maxLength,
    minLength = 2,
    validation,
}: TextInputQuestionProps) {
    const [localValue, setLocalValue] = useState(value);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        onChange(newValue);

        // Clear error when user starts typing
        if (error && newValue.length >= minLength) {
            setError(null);
        }
    };

    const handleBlur = () => {
        setTouched(true);

        // Validate on blur
        if (localValue.length < minLength) {
            setError(`Please enter at least ${minLength} characters`);
            return;
        }

        if (validation) {
            const validationError = validation(localValue);
            setError(validationError);
        }
    };

    const characterCount = localValue.length;
    const showCharacterCount = maxLength !== undefined;

    return (
        <div className="space-y-4 max-w-2xl">
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

            <div className="space-y-2">
                <Input
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    className={`text-lg h-14 ${error && touched ? "border-destructive" : ""}`}
                    aria-invalid={error && touched ? "true" : "false"}
                />

                <div className="flex items-center justify-between">
                    {error && touched ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : (
                        <div />
                    )}

                    {showCharacterCount && (
                        <p className="text-xs text-muted-foreground">
                            {characterCount} / {maxLength}
                        </p>
                    )}
                </div>
            </div>

            {/* Helpful hints */}
            {!touched && !error && (
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>💡 Tip: Press Enter to move to the next question</p>
                </div>
            )}
        </div>
    );
}
