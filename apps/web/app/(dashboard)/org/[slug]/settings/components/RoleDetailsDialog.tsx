'use client';

import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { RoleWithPermissions } from '../types/settings';

interface RoleDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role: RoleWithPermissions | null;
}

export function RoleDetailsDialog({ open, onOpenChange, role }: RoleDetailsDialogProps) {
    if (!role) return null;

    // Group permissions by group
    const groupedPermissions = role.permissions.reduce((acc, permission) => {
        if (!acc[permission.group]) {
            acc[permission.group] = [];
        }
        acc[permission.group].push(permission);
        return acc;
    }, {} as Record<string, typeof role.permissions>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{role.name}</DialogTitle>
                    <DialogDescription>
                        {role.description || 'No description available'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Total Permissions:</span>{' '}
                            <Badge variant="secondary">{role.permissions.length}</Badge>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Users with this role:</span>{' '}
                            <Badge variant="outline">{role.userCount || 0}</Badge>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Permissions</h4>
                        <div className="h-[400px] overflow-y-auto pr-4">
                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                    <div key={group}>
                                        <h5 className="font-medium text-sm mb-2 capitalize">
                                            {group.replace(/_/g, ' ')}
                                        </h5>
                                        <div className="space-y-1 ml-4">
                                            {permissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Badge variant="outline" className="shrink-0">
                                                        {permission.key}
                                                    </Badge>
                                                    {permission.description && (
                                                        <span className="text-muted-foreground text-xs mt-0.5">
                                                            {permission.description}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
