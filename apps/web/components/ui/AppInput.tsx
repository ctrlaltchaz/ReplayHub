"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Input } from "./input";

interface AppInputProps extends React.ComponentProps<"input"> {
    errorText?: string;
    helperText?: string;
    label?: string;
}

export function AppInput({
    className,
    errorText,
    helperText,
    label,
    id,
    ...props
}: AppInputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorText;

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {label}
                </label>
            )}
            <Input
                id={inputId}
                className={cn(
                    hasError && "border-destructive focus-visible:ring-destructive/20",
                    className
                )}
                {...props}
            />
            {(errorText || helperText) && (
                <p className={cn(
                    "text-sm",
                    hasError ? "text-destructive" : "text-muted-foreground"
                )}>
                    {errorText || helperText}
                </p>
            )}
        </div>
    );
}