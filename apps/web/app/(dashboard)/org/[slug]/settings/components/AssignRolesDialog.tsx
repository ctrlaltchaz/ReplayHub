'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import type { OrgUser, Role } from '../types/settings';

interface AssignRolesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: OrgUser | null;
    availableRoles: Role[];
    onSubmit: (roleIds: string[]) => void;
    isLoading?: boolean;
}

export function AssignRolesDialog({
    open,
    onOpenChange,
    user,
    availableRoles,
    onSubmit,
    isLoading,
}: AssignRolesDialogProps) {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            setSelectedRoles(user.roles);
        } else {
            setSelectedRoles([]);
        }
    }, [user]);

    const handleToggleRole = (roleName: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName)
                ? prev.filter((r) => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSubmit = () => {
        onSubmit(selectedRoles);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Roles</DialogTitle>
                    <DialogDescription>
                        Select roles to assign to {user.displayName || user.email}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {availableRoles.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No roles available
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {availableRoles.map((role) => (
                                <div key={role.id} className="flex items-start space-x-3">
                                    <Checkbox
                                        id={role.id}
                                        checked={selectedRoles.includes(role.name)}
                                        onCheckedChange={() => handleToggleRole(role.name)}
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor={role.id}
                                            className="font-medium cursor-pointer"
                                        >
                                            {role.name}
                                        </Label>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {role.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {role.permissionCount || 0} permissions
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
