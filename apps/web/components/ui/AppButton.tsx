"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button, buttonVariants } from "./button";
import { Spinner } from "./Spinner";

interface AppButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function AppButton({
    children,
    isLoading,
    leftIcon,
    rightIcon,
    disabled,
    className,
    variant,
    size,
    ...props
}: AppButtonProps) {
    return (
        <Button
            disabled={disabled || isLoading}
            className={className}
            variant={variant}
            size={size}
            {...props}
        >
            {isLoading ? (
                <>
                    <Spinner size="sm" className="mr-2" />
                    {children}
                </>
            ) : (
                <>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </>
            )}
        </Button>
    );
}