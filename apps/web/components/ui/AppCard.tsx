import { cn } from "@/lib/utils";
import * as React from "react";
import { Card, CardContent, CardHeader } from "./card";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AppCard({ className, ...props }: AppCardProps) {
    return <Card className={cn(className)} {...props} />;
}

interface AppCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AppCardHeader({ className, ...props }: AppCardHeaderProps) {
    return <CardHeader className={cn(className)} {...props} />;
}

interface AppCardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AppCardContent({ className, ...props }: AppCardContentProps) {
    return <CardContent className={cn(className)} {...props} />;
}