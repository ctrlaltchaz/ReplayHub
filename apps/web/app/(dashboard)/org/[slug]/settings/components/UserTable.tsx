'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Ban, CheckCircle, Edit, Search, Shield } from 'lucide-react';
import { useState } from 'react';
import type { OrgUser } from '../types/settings';

interface UserTableProps {
    users: OrgUser[];
    onEdit: (user: OrgUser) => void;
    onAssignRoles: (user: OrgUser) => void;
    onDeactivate: (userId: string) => void;
    onReactivate: (userId: string) => void;
}

export function UserTable({ users, onEdit, onAssignRoles, onDeactivate, onReactivate }: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.displayName || '—'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length === 0 ? (
                                                <span className="text-sm text-muted-foreground">No roles</span>
                                            ) : (
                                                user.roles.map((role) => (
                                                    <Badge key={role} variant="secondary">
                                                        {role}
                                                    </Badge>
                                                ))
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <Badge variant="default">Active</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(user)}
                                                title="Edit user"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onAssignRoles(user)}
                                                title="Assign roles"
                                            >
                                                <Shield className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            {user.isActive ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDeactivate(user.id)}
                                                    title="Deactivate user"
                                                >
                                                    <Ban className="h-4 w-4 text-destructive" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onReactivate(user.id)}
                                                    title="Reactivate user"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
