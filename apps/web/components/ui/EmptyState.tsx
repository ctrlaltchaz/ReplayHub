import { cn } from "@/lib/utils";
import * as React from "react";

interface EmptyStateProps {
    title: string;
    description?: string;
    cta?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    title,
    description,
    cta,
    icon,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-12 px-4 text-center",
            className
        )}>
            {icon && (
                <div className="mb-4 text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-muted-foreground mb-6 max-w-md">
                    {description}
                </p>
            )}
            {cta && (
                <div>
                    {cta}
                </div>
            )}
        </div>
    );
}