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
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import type { Role } from '../types/settings';

interface RoleTableProps {
    roles: Role[];
    onViewDetails: (role: Role) => void;
}

export function RoleTable({ roles, onViewDetails }: RoleTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by role name or description..."
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
                            <TableHead>Role Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRoles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No roles found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRoles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>
                                        {role.description ? (
                                            <span className="text-sm text-muted-foreground">
                                                {role.description}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">
                                                No description
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {role.permissionCount || 0} permissions
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {role.userCount || 0} users
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewDetails(role)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
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
