'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiPut } from '@/lib/api/client';
import { Activity, ArrowLeft, Calendar, Clock, Edit, Key, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface GlobalUser {
    id: string;
    email: string;
    name?: string;
    isGlobalAdmin: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    loginAttempts?: number;
    lastLoginIp?: string;
    totpEnabled?: boolean;
}

interface LoginHistory {
    id: string;
    ip: string;
    userAgent: string;
    success: boolean;
    createdAt: string;
}

// interface UserSession {
//     id: string;
//     ip: string;
//     userAgent: string;
//     lastActivity: string;
//     createdAt: string;
// }

export default function GlobalUserDetailsPage() {
    const params = useParams();
    const userId = params?.userId as string;

    const [user, setUser] = useState<GlobalUser | null>(null);
    const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        isGlobalAdmin: false,
        isActive: true
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Mock data for development
                const mockUser: GlobalUser = {
                    id: userId,
                    email: 'admin@example.com',
                    name: 'System Administrator',
                    isGlobalAdmin: true,
                    lastLoginAt: new Date().toISOString(),
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date().toISOString(),
                    isActive: true,
                    loginAttempts: 0,
                    lastLoginIp: '192.168.1.100',
                    totpEnabled: true
                };

                const mockLoginHistory: LoginHistory[] = [
                    {
                        id: '1',
                        ip: '192.168.1.100',
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        success: true,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        ip: '192.168.1.100',
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        success: true,
                        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                    }
                ];

                // Not used yet - reserved for future session management feature
                // const mockSessions: UserSession[] = [
                //     {
                //         id: '1',
                //         ip: '192.168.1.100',
                //         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                //         lastActivity: new Date().toISOString(),
                //         createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                //     }
                // ];

                // In production:
                // const [userData, historyData, sessionsData] = await Promise.all([
                //     apiGet<GlobalUser>(`/admin/global-users/${userId}`),
                //     apiGet<LoginHistory[]>(`/admin/global-users/${userId}/login-history`),
                //     apiGet<UserSession[]>(`/admin/global-users/${userId}/sessions`)
                // ]);

                setUser(mockUser);
                setLoginHistory(mockLoginHistory);

                setEditForm({
                    name: mockUser.name || '',
                    email: mockUser.email,
                    isGlobalAdmin: mockUser.isGlobalAdmin,
                    isActive: mockUser.isActive
                });
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                setError('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updatedUser = await apiPut<GlobalUser>(`/admin/global-users/${userId}`, editForm);
            setUser(updatedUser);
            setIsEditOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight font-montserrat">Loading...</h1>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="h-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-32 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="h-64 bg-muted rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container mx-auto p-6">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/global-users">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight font-montserrat">Error</h1>
                    </div>
                    <div className="text-center p-8">
                        <p className="text-muted-foreground font-montserrat">{error || 'User not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/global-users">
                            <Button variant="outline" size="sm" className="font-montserrat">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Users
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight font-montserrat">
                                {user.name || user.email}
                            </h1>
                            <p className="text-muted-foreground font-montserrat">
                                Global User Details
                            </p>
                        </div>
                    </div>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-montserrat font-semibold">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="font-montserrat font-bold">Edit User</DialogTitle>
                                <DialogDescription className="font-montserrat">
                                    Update user information and permissions
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="font-montserrat font-medium">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="font-montserrat"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-montserrat font-medium">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="font-montserrat"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isGlobalAdmin"
                                        checked={editForm.isGlobalAdmin}
                                        onChange={(e) => setEditForm({ ...editForm, isGlobalAdmin: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isGlobalAdmin" className="font-montserrat font-medium">
                                        Global Admin Privileges
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isActive" className="font-montserrat font-medium">
                                        Account Active
                                    </Label>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={isLoading} className="font-montserrat font-semibold">
                                        {isLoading ? 'Updating...' : 'Update User'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Status</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant={user.isActive ? "default" : "secondary"} className="font-montserrat">
                                {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Role</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant={user.isGlobalAdmin ? "default" : "outline"} className="font-montserrat">
                                {user.isGlobalAdmin ? "Super Admin" : "User"}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">Last Login</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-montserrat">
                                {user.lastLoginAt
                                    ? new Date(user.lastLoginAt).toLocaleDateString()
                                    : 'Never'
                                }
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-montserrat">2FA Status</CardTitle>
                            <Key className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant={user.totpEnabled ? "default" : "outline"} className="font-montserrat">
                                {user.totpEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* User Information */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-montserrat font-bold">User Information</CardTitle>
                            <CardDescription className="font-montserrat">
                                Basic account details and settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label className="font-montserrat font-medium">Email</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-montserrat">{user.email}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="font-montserrat font-medium">Full Name</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-montserrat">{user.name || 'Not set'}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="font-montserrat font-medium">Created</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-montserrat">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="font-montserrat font-medium">Last IP</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-montserrat">{user.lastLoginIp || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-montserrat font-bold">Recent Activity</CardTitle>
                            <CardDescription className="font-montserrat">
                                Latest login attempts and sessions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loginHistory.slice(0, 3).map((entry) => (
                                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium font-montserrat">
                                                {new Date(entry.createdAt).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-montserrat">
                                                From {entry.ip}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={entry.success ? "default" : "destructive"}
                                            className="font-montserrat"
                                        >
                                            {entry.success ? "Success" : "Failed"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Full Activity History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-montserrat font-bold">Login History</CardTitle>
                        <CardDescription className="font-montserrat">
                            Complete history of login attempts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-montserrat font-semibold">Time</TableHead>
                                    <TableHead className="font-montserrat font-semibold">IP Address</TableHead>
                                    <TableHead className="font-montserrat font-semibold">User Agent</TableHead>
                                    <TableHead className="font-montserrat font-semibold">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loginHistory.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-montserrat">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-montserrat">{entry.ip}</TableCell>
                                        <TableCell className="font-montserrat text-sm">
                                            {entry.userAgent.substring(0, 50)}...
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={entry.success ? "default" : "destructive"}
                                                className="font-montserrat"
                                            >
                                                {entry.success ? "Success" : "Failed"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}