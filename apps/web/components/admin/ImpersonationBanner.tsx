'use client';

import { Button } from "@/components/ui/button";
import { useImpersonationStatus, useStopImpersonation } from "@/hooks/admin/global";
import { adminPath } from "@/lib/paths/org";
import { AlertTriangle, UserX } from "lucide-react";

interface ImpersonationBannerProps {
    orgName?: string;
}

/**
 * Reusable impersonation banner component
 * Shows when a global admin is impersonating an organization
 */
export function ImpersonationBanner({ orgName }: ImpersonationBannerProps) {
    const { data: impersonationStatus } = useImpersonationStatus();
    const stopImpersonation = useStopImpersonation();

    const isImpersonating = impersonationStatus?.isImpersonating || false;

    const handleStopImpersonation = async () => {
        try {
            await stopImpersonation.mutateAsync();
            // Redirect back to control center
            window.location.href = adminPath.controlCenter();
        } catch (error) {
            console.error('Failed to stop impersonation:', error);
        }
    };

    // Don't render if not impersonating
    if (!isImpersonating) {
        return null;
    }

    return (
        <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                    You are impersonating{' '}
                    <strong>{orgName || 'this organization'}</strong>{' '}
                    as a Global Administrator
                </span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleStopImpersonation}
                disabled={stopImpersonation.isPending}
                className="text-yellow-950 hover:bg-yellow-400 hover:text-yellow-950 shrink-0"
            >
                <UserX className="h-4 w-4 mr-1" />
                {stopImpersonation.isPending ? 'Stopping...' : 'Stop Impersonation'}
            </Button>
        </div>
    );
}