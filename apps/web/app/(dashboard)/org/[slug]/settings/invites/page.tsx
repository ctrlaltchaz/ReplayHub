'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, Clock, Copy, Link2, Mail, Plus, Send, Trash2, UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';

interface Invite {
    id: string;
    email: string | null;
    inviteMethod?: 'EMAIL' | 'LINK';
    token?: string;
    roles: string[];
    invitedBy: string;
    expiresAt: string;
    createdAt: string;
}

export default function InvitesPage() {
    const params = useParams();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const orgSlug = params?.slug as string;

    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Invite dialog state
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteFormData, setInviteFormData] = useState({
        email: '',
        roleIds: [] as string[],
        method: 'EMAIL' as 'EMAIL' | 'LINK'
    });

    // Success dialog for invite link
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    // View link dialog
    const [viewLinkInvite, setViewLinkInvite] = useState<Invite | null>(null);

    // Delete confirmation dialog
    const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);
    const [isRevoking, setIsRevoking] = useState(false);

    const { data: roles = [] } = useRoles(orgSlug);

    const getInviteUrl = (token: string) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        return `${baseUrl}/invite/${token}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast({
                title: "Copied!",
                description: "Invite link copied to clipboard"
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please copy the link manually",
                variant: "destructive"
            });
        }
    };

    // Fetch invites on mount
    React.useEffect(() => {
        fetchInvites();
    }, [orgSlug]);

    const fetchInvites = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(getApiUrl(`/org/${orgSlug}/invites`), {
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch invites');
            }

            const data = await response.json();
            setInvites(data.invites || []);
        } catch (err: any) {
            console.error('Failed to fetch invites:', err);
            toast({
                title: 'Error',
                description: err.message || 'Failed to load invites',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateInvite = () => {
        setInviteFormData({
            email: '',
            roleIds: [],
            method: 'EMAIL'
        });
        setIsInviteDialogOpen(true);
    };

    const handleSubmitInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate based on method
        if (inviteFormData.method === 'EMAIL' && !inviteFormData.email) {
            toast({
                title: 'Validation Error',
                description: 'Please provide an email address',
                variant: 'destructive'
            });
            return;
        }

        if (inviteFormData.roleIds.length === 0) {
            toast({
                title: 'Validation Error',
                description: 'Please select at least one role',
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Convert role IDs to role names
            const selectedRoles = roles.filter(role => inviteFormData.roleIds.includes(role.id));
            const roleNames = selectedRoles.map(role => role.name);

            const inviteData: any = {
                roles: roleNames, // Send role names, not IDs
                method: inviteFormData.method
            };

            // Only include email for EMAIL method
            if (inviteFormData.method === 'EMAIL') {
                inviteData.email = inviteFormData.email;
            }

            const response = await fetch(getApiUrl(`/org/${orgSlug}/invites`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(inviteData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send invite');
            }

            const data = await response.json();

            // Show success based on method
            if (inviteFormData.method === 'LINK') {
                setInviteUrl(data.inviteUrl);
                setShowSuccessDialog(true);
            } else {
                toast({
                    title: "Invite sent",
                    description: `Invitation sent to ${inviteFormData.email}`
                });
            }

            setIsInviteDialogOpen(false);
            await fetchInvites();
        } catch (err: any) {
            console.error('Failed to send invite:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to send invite",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevokeInvite = async () => {
        if (!inviteToRevoke) return;

        try {
            setIsRevoking(true);

            const response = await fetch(getApiUrl(`/org/${orgSlug}/invites/${inviteToRevoke.id}`), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to revoke invite');
            }

            toast({
                title: "Invite revoked",
                description: inviteToRevoke.email
                    ? `Invitation to ${inviteToRevoke.email} has been revoked.`
                    : "Invitation link has been revoked."
            });

            setInviteToRevoke(null);
            await fetchInvites();
        } catch (err: any) {
            console.error('Failed to revoke invite:', err);
            toast({
                title: "Error",
                description: err.message || "Failed to revoke invite",
                variant: "destructive"
            });
        } finally {
            setIsRevoking(false);
        }
    };

    const toggleRole = (roleId: string) => {
        setInviteFormData(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId]
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading invites...</p>
            </div>
        );
    }

    const activeInvites = invites.filter(inv => !isExpired(inv.expiresAt));
    const expiredInvites = invites.filter(inv => isExpired(inv.expiresAt));

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold tracking-tight">Invitations</h2>
                <p className="text-muted-foreground">
                    Send and manage invitations to join your organization
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invites.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeInvites.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiredInvites.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Roles</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roles.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Invites Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Pending Invitations</CardTitle>
                        <Button onClick={handleCreateInvite}>
                            <Plus className="h-4 w-4 mr-2" />
                            Send Invite
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Method</TableHead>
                                <TableHead>Email / Link</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Invited By</TableHead>
                                <TableHead>Sent</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invites.map((invite) => (
                                <TableRow key={invite.id} className={isExpired(invite.expiresAt) ? 'opacity-50' : ''}>
                                    <TableCell>
                                        {invite.inviteMethod === 'LINK' || !invite.email ? (
                                            <Badge variant="outline" className="gap-1">
                                                <Link2 className="h-3 w-3" />
                                                Link
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                <Mail className="h-3 w-3" />
                                                Email
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {invite.email ? (
                                                <>
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{invite.email}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground italic">Shareable Link</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {invite.roles.map((role, idx) => (
                                                <Badge key={idx} variant="secondary">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground">{invite.invitedBy}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(invite.createdAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {isExpired(invite.expiresAt) ? (
                                                <Badge variant="destructive">Expired</Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDateTime(invite.expiresAt)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* Copy Link button for LINK invites */}
                                            {(!invite.email || invite.inviteMethod === 'LINK') && invite.token && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setViewLinkInvite(invite)}
                                                    title="View invite link"
                                                >
                                                    <Link2 className="h-4 w-4 text-blue-500" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setInviteToRevoke(invite)}
                                                title="Revoke invite"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invites.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="text-muted-foreground">
                                            No pending invitations. Send an invite to get started.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Send Invite Dialog */}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Send Invitation</DialogTitle>
                        <DialogDescription>
                            Choose how you want to invite someone to this organization.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Method Selection */}
                        <div className="space-y-3">
                            <Label>Invite Method <span className="text-red-500">*</span></Label>
                            <RadioGroup
                                value={inviteFormData.method}
                                onValueChange={(value: 'EMAIL' | 'LINK') =>
                                    setInviteFormData({ ...inviteFormData, method: value })
                                }
                            >
                                <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                                    <RadioGroupItem value="EMAIL" id="method-email" />
                                    <div className="flex-1">
                                        <label htmlFor="method-email" className="cursor-pointer">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Mail className="h-4 w-4" />
                                                Send via Email
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Send an invitation directly to a specific email address
                                            </p>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent">
                                    <RadioGroupItem value="LINK" id="method-link" />
                                    <div className="flex-1">
                                        <label htmlFor="method-link" className="cursor-pointer">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Link2 className="h-4 w-4" />
                                                Generate Link
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Create a shareable invite link that anyone can use
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Email (only for EMAIL method) */}
                        {inviteFormData.method === 'EMAIL' && (
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteFormData.email}
                                    onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Roles */}
                        <div className="space-y-2">
                            <Label>
                                Roles <span className="text-red-500">*</span>
                            </Label>
                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`role-${role.id}`}
                                            checked={inviteFormData.roleIds.includes(role.id)}
                                            onChange={() => toggleRole(role.id)}
                                            className="h-4 w-4 rounded border-gray-300"
                                        />
                                        <label
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm cursor-pointer flex-1"
                                        >
                                            {role.name}
                                        </label>
                                    </div>
                                ))}
                                {roles.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No roles available. Create a role first.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsInviteDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitInvite}
                            disabled={isSubmitting ||
                                (inviteFormData.method === 'EMAIL' && !inviteFormData.email) ||
                                inviteFormData.roleIds.length === 0
                            }
                        >
                            {isSubmitting ? 'Creating...' : (
                                <>
                                    {inviteFormData.method === 'EMAIL' ? (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Invite
                                        </>
                                    ) : (
                                        <>
                                            <Link2 className="h-4 w-4 mr-2" />
                                            Generate Link
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Revoke Invite Confirmation Dialog */}
            <Dialog open={!!inviteToRevoke} onOpenChange={(open) => !open && setInviteToRevoke(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revoke Invitation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to revoke this invitation
                            {inviteToRevoke?.email && (
                                <>
                                    {' '}to <strong>{inviteToRevoke.email}</strong>
                                </>
                            )}
                            ? It will no longer be usable.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setInviteToRevoke(null)}
                            disabled={isRevoking}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRevokeInvite}
                            disabled={isRevoking}
                        >
                            {isRevoking ? 'Revoking...' : 'Revoke Invite'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Dialog with Invite Link */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Invite Link Generated!</DialogTitle>
                        <DialogDescription>
                            Share this link with anyone you want to invite to your organization.
                            The link will expire in 7 days.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Invite Link</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-background p-2 rounded text-xs break-all">
                                    {inviteUrl}
                                </code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => inviteUrl && copyToClipboard(inviteUrl)}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>Important:</strong> Anyone with this link can register and join your organization
                                with the selected roles. Keep it secure and only share it with people you trust.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowSuccessDialog(false)}>
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Link Dialog */}
            <Dialog open={!!viewLinkInvite} onOpenChange={(open) => !open && setViewLinkInvite(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Invite Link</DialogTitle>
                        <DialogDescription>
                            Share this link to invite people to your organization
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Shareable Link</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-background p-2 rounded text-xs break-all">
                                    {viewLinkInvite?.token && getInviteUrl(viewLinkInvite.token)}
                                </code>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => viewLinkInvite?.token && copyToClipboard(getInviteUrl(viewLinkInvite.token))}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Roles:</span>
                                <div className="flex flex-wrap gap-1">
                                    {viewLinkInvite?.roles.map((role, idx) => (
                                        <Badge key={idx} variant="secondary">{role}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Expires:</span>
                                <span className="font-medium">
                                    {viewLinkInvite && formatDateTime(viewLinkInvite.expiresAt)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Created:</span>
                                <span className="font-medium">
                                    {viewLinkInvite && formatDate(viewLinkInvite.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
                            <p className="text-xs text-amber-900 dark:text-amber-100">
                                <strong>Security Note:</strong> Anyone with this link can register and join your organization.
                                Only share it with trusted individuals.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewLinkInvite(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
