'use client';

import { DiscordLinkCard } from '@/components/profile/DiscordLinkCard';
import { PlayerProfileCard, PlayerProfileCardSkeleton } from '@/components/profile/PlayerProfileCard';
import { PlayerStatsCard } from '@/components/profile/PlayerStatsCard';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getServerUrl } from '@/lib/api/config';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { useUpdateProfile, useUserProfile } from '@/lib/hooks/useProfile';
import { Building2, Calendar, Camera, Clock, Github, Globe, KeyRound, Linkedin, Mail, MapPin, Shield, Trophy, Twitter, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    usePageTitle('My Profile');

    const params = useParams();
    const slug = params?.slug as string;
    const { globalUser, orgUser, refresh: refreshAuth } = useAuth();
    const { profile, loading: profileLoading, error: profileError, refetch } = useUserProfile();
    const { updateProfile, loading: updateLoading } = useUpdateProfile();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [playerData, setPlayerData] = useState<any>(null);
    const [playerLoading, setPlayerLoading] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [emailVerificationSent, setEmailVerificationSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [newEmail, setNewEmail] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        location: '',
        timezone: '',
        socialLinks: {
            linkedin: '',
            twitter: '',
            github: '',
            website: '',
        },
    });

    // Convert relative avatar URL to full URL
    const avatarUrl = profile?.avatar?.startsWith('/')
        ? `${getServerUrl()}${profile.avatar}`
        : profile?.avatar;

    // Update form when profile loads
    useEffect(() => {
        if (profile) {
            setProfileData({
                name: profile.name || '',
                email: profile.email || '',
                bio: profile.bio || '',
                location: profile.location || '',
                timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                socialLinks: {
                    linkedin: profile.socialLinks?.linkedin || '',
                    twitter: profile.socialLinks?.twitter || '',
                    github: profile.socialLinks?.github || '',
                    website: profile.socialLinks?.website || '',
                },
            });
        }
    }, [profile]);

    // Fetch player data
    useEffect(() => {
        const fetchPlayer = async () => {
            if (!slug) return;

            setPlayerLoading(true);
            try {
                const response = await fetch(`${getServerUrl()}/api/org/${slug}/players/me`, {
                    credentials: 'include'
                });
                if (response.ok) {
                    const text = await response.text();
                    if (text) {
                        try {
                            const data = JSON.parse(text);
                            setPlayerData(data.player);
                        } catch (e) {
                            console.error('Failed to parse player response:', text);
                            setPlayerData(null);
                        }
                    } else {
                        setPlayerData(null);
                    }
                } else {
                    setPlayerData(null);
                }
            } catch (error) {
                console.error('Failed to fetch player:', error);
                setPlayerData(null);
            } finally {
                setPlayerLoading(false);
            }
        };

        fetchPlayer();
    }, [slug]);

    const handlePlayerUpdate = async () => {
        // Refetch player data
        if (!slug) return;

        try {
            const response = await fetch(`${getServerUrl()}/api/org/${slug}/players/me`, {
                credentials: 'include'
            });
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    try {
                        const data = JSON.parse(text);
                        // API now returns { player: ... }
                        setPlayerData(data.player);
                    } catch (e) {
                        console.error('Failed to parse player refresh response:', text);
                    }
                }
            } else {
                console.log('Failed to refresh player data:', response.status);
            }
        } catch (error) {
            console.error('Failed to refresh player:', error);
        }
    };

    const handleSave = async () => {
        try {
            await updateProfile({
                bio: profileData.bio,
                location: profileData.location,
                timezone: profileData.timezone,
                socialLinks: profileData.socialLinks,
            });

            toast({
                title: 'Success',
                description: 'Profile updated successfully',
            });
            setIsEditing(false);
            refetch(); // Refetch to get updated data
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile',
                variant: 'destructive',
            });
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Error',
                description: 'Invalid file type. Only images (JPG, PNG, GIF, WebP) are allowed.',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Error',
                description: 'File too large. Maximum size is 5MB.',
                variant: 'destructive',
            });
            return;
        }

        try {
            setUploadingAvatar(true);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);

            // Upload avatar
            const response = await fetch(`${getServerUrl()}/api/global/auth/avatar`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to upload avatar' }));
                throw new Error(errorData.message || 'Failed to upload avatar');
            }

            const data = await response.json();

            toast({
                title: 'Success',
                description: 'Avatar uploaded successfully',
            });

            // Refetch profile and auth context to update avatar everywhere
            await refetch();
            await refreshAuth();
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to upload avatar',
                variant: 'destructive',
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handlePasswordChange = async () => {
        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'Please fill in all password fields',
                variant: 'destructive',
            });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast({
                title: 'Error',
                description: 'Password must be at least 8 characters long',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`${getServerUrl()}/api/global/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to change password' }));
                throw new Error(errorData.message || 'Failed to change password');
            }

            toast({
                title: 'Success',
                description: 'Password changed successfully',
            });

            // Reset form
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to change password',
                variant: 'destructive',
            });
        }
    };

    const handleEmailChange = async () => {
        if (!newEmail || newEmail === profile?.email) {
            toast({
                title: 'Error',
                description: 'Please enter a different email address',
                variant: 'destructive',
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast({
                title: 'Error',
                description: 'Please enter a valid email address',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`${getServerUrl()}/api/global/auth/change-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ newEmail }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to send verification code' }));
                throw new Error(errorData.message || 'Failed to send verification code');
            }

            toast({
                title: 'Success',
                description: 'Verification code sent! Please check your new email address.',
            });

            // Show verification code input
            setEmailVerificationSent(true);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to send verification code',
                variant: 'destructive',
            });
        }
    };

    const handleVerifyEmailChange = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            toast({
                title: 'Error',
                description: 'Please enter the 6-digit verification code',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`${getServerUrl()}/api/global/auth/verify-email-change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    newEmail,
                    code: verificationCode
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to verify code' }));
                throw new Error(errorData.message || 'Failed to verify code');
            }

            toast({
                title: 'Success',
                description: 'Email address changed successfully!',
            });

            // Reset form
            setNewEmail('');
            setVerificationCode('');
            setIsChangingEmail(false);
            setEmailVerificationSent(false);
            await refetch();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Invalid or expired verification code',
                variant: 'destructive',
            });
        }
    };

    if (profileLoading) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="p-8">
                <p className="text-destructive">Error: {profileError}</p>
            </div>
        );
    }

    if (!globalUser || !profile) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">No profile data available</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage your personal information and preferences</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={updateLoading}
                            className="flex-1 sm:flex-initial"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateLoading}
                            className="flex-1 sm:flex-initial"
                        >
                            {updateLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
                                        {uploadingAvatar ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                                <span className="text-xs text-white">Uploading...</span>
                                            </div>
                                        ) : avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt={profile.name || 'Avatar'}
                                                width={128}
                                                height={128}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <UserIcon className="h-16 w-16 text-white" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        <Camera className="h-8 w-8 text-white" />
                                    </label>
                                </div>

                                {/* Name & Email */}
                                <div className="text-center space-y-1 w-full">
                                    {isEditing ? (
                                        <Input
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="text-center text-xl font-bold"
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-bold">{profile.name || 'No name set'}</h2>
                                    )}
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                    {orgUser && orgUser.roles && orgUser.roles.length > 0 && (
                                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                                            {orgUser.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium uppercase"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Bio */}
                                <div className="w-full space-y-2">
                                    <Label>Bio</Label>
                                    {isEditing ? (
                                        <Textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                            className="resize-none"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {profileData.bio || 'No bio added yet'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Account Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Member Since</Label>
                                <p className="text-sm font-medium">
                                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
                                </p>
                            </div>
                            {profile.lastLoginAt && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Last Login</Label>
                                    <p className="text-sm font-medium">
                                        {new Date(profile.lastLoginAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* Security Section */}
                            <div className="pt-4 border-t">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                                    <Shield className="h-3.5 w-3.5" />
                                    Security
                                </Label>

                                {/* Change Password */}
                                <div className="space-y-2 mb-3">
                                    {!isChangingPassword ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            <KeyRound className="h-4 w-4 mr-2" />
                                            Change Password
                                        </Button>
                                    ) : (
                                        <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                                            <Input
                                                type="password"
                                                placeholder="Current password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="h-9"
                                            />
                                            <Input
                                                type="password"
                                                placeholder="New password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="h-9"
                                            />
                                            <Input
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="h-9"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handlePasswordChange}
                                                    className="flex-1"
                                                >
                                                    Update
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsChangingPassword(false);
                                                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Change Email */}
                                <div className="space-y-2">
                                    {!isChangingEmail ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => setIsChangingEmail(true)}
                                        >
                                            <Mail className="h-4 w-4 mr-2" />
                                            Change Email
                                        </Button>
                                    ) : (
                                        <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                Current: {profile.email}
                                            </div>

                                            {!emailVerificationSent ? (
                                                <>
                                                    <Input
                                                        type="email"
                                                        placeholder="New email address"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        className="h-9"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={handleEmailChange}
                                                            className="flex-1"
                                                        >
                                                            Send Code
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsChangingEmail(false);
                                                                setNewEmail('');
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                                                        ✓ Code sent to {newEmail}
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        placeholder="Enter 6-digit code"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        maxLength={6}
                                                        className="h-9 text-center text-lg tracking-widest font-mono"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={handleVerifyEmailChange}
                                                            className="flex-1"
                                                            disabled={verificationCode.length !== 6}
                                                        >
                                                            Verify
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsChangingEmail(false);
                                                                setNewEmail('');
                                                                setVerificationCode('');
                                                                setEmailVerificationSent(false);
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleEmailChange}
                                                        className="w-full text-xs"
                                                    >
                                                        Resend Code
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Player Profile */}
                    {playerLoading ? (
                        <PlayerProfileCardSkeleton />
                    ) : playerData ? (
                        <PlayerProfileCard
                            player={playerData}
                            slug={slug}
                            onUpdate={handlePlayerUpdate}
                        />
                    ) : null}
                </div>

                {/* Middle Column - Discord & Player */}
                <div className="space-y-6">
                    {/* Discord Integration */}
                    <DiscordLinkCard />

                    {/* Activity & Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Activity & Statistics
                            </CardTitle>
                            <CardDescription>Your platform engagement</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {(profile.organisations?.length || 0) + (profile.orgUsers?.length || 0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Organizations</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {profile.orgUsers?.reduce((total, orgUser) => total + (orgUser.roles?.length || 0), 0) || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Total Roles</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Days Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {profile.organisations?.length || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Orgs Owned</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Your location and timezone preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Location
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="location"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            placeholder="e.g., San Francisco, CA"
                                        />
                                    ) : (
                                        <p className="text-sm">{profileData.location || 'Not set'}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="timezone" className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Timezone
                                    </Label>
                                    {isEditing ? (
                                        <Input
                                            id="timezone"
                                            value={profileData.timezone}
                                            onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                                            placeholder="e.g., America/Los_Angeles"
                                        />
                                    ) : (
                                        <p className="text-sm">{profileData.timezone}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Game Statistics */}
                    {playerData && (
                        <PlayerStatsCard
                            playerId={playerData.id}
                            slug={slug}
                            showPrivacyToggle={true}
                            statsVisible={playerData.statsVisible ?? true}
                        />
                    )}

                    {/* Social Links */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Social Links
                            </CardTitle>
                            <CardDescription>Connect your social media accounts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkedin" className="flex items-center gap-2">
                                    <Linkedin className="h-4 w-4" />
                                    LinkedIn
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="linkedin"
                                        value={profileData.socialLinks.linkedin}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            socialLinks: { ...profileData.socialLinks, linkedin: e.target.value }
                                        })}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                ) : (
                                    <p className="text-sm">{profileData.socialLinks.linkedin || 'Not set'}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitter" className="flex items-center gap-2">
                                    <Twitter className="h-4 w-4" />
                                    Twitter
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="twitter"
                                        value={profileData.socialLinks.twitter}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            socialLinks: { ...profileData.socialLinks, twitter: e.target.value }
                                        })}
                                        placeholder="https://twitter.com/username"
                                    />
                                ) : (
                                    <p className="text-sm">{profileData.socialLinks.twitter || 'Not set'}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="github" className="flex items-center gap-2">
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="github"
                                        value={profileData.socialLinks.github}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            socialLinks: { ...profileData.socialLinks, github: e.target.value }
                                        })}
                                        placeholder="https://github.com/username"
                                    />
                                ) : (
                                    <p className="text-sm">{profileData.socialLinks.github || 'Not set'}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Website
                                </Label>
                                {isEditing ? (
                                    <Input
                                        id="website"
                                        value={profileData.socialLinks.website}
                                        onChange={(e) => setProfileData({
                                            ...profileData,
                                            socialLinks: { ...profileData.socialLinks, website: e.target.value }
                                        })}
                                        placeholder="https://yourwebsite.com"
                                    />
                                ) : (
                                    <p className="text-sm">{profileData.socialLinks.website || 'Not set'}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Organization Memberships */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Organization Memberships
                            </CardTitle>
                            <CardDescription>Organizations you belong to</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {profile.organisations && profile.organisations.length > 0 && (
                                <>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Owner
                                    </div>
                                    {profile.organisations.map((org) => (
                                        <div
                                            key={org.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                                                    {(org as any).branding?.logoUrl || (org as any).branding?.logo ? (
                                                        <Image
                                                            src={`${getServerUrl()}${(org as any).branding?.logoUrl || (org as any).branding?.logo}`}
                                                            alt={org.name}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{org.name}</p>
                                                    <p className="text-xs text-muted-foreground">/{org.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                                    Owner
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}

                            {profile.orgUsers && profile.orgUsers.length > 0 && (
                                <>
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">
                                        Member
                                    </div>
                                    {profile.orgUsers.map((orgUser) => {
                                        // Organisation now comes directly from backend
                                        if (!orgUser.organisation) {
                                            console.warn('No organisation data for orgUser:', orgUser);
                                            return null;
                                        }

                                        // Get role names from orgUser roles
                                        const roleNames = orgUser.roles.map(r => r.role.name).join(', ') || 'Member';

                                        return (
                                            <div
                                                key={orgUser.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                                                        {(orgUser.organisation as any).branding?.logoUrl || (orgUser.organisation as any).branding?.logo ? (
                                                            <Image
                                                                src={`${getServerUrl()}${(orgUser.organisation as any).branding?.logoUrl || (orgUser.organisation as any).branding?.logo}`}
                                                                alt={orgUser.organisation.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{orgUser.organisation.name}</p>
                                                        <p className="text-xs text-muted-foreground">/{orgUser.organisation.slug}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {orgUser.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium capitalize"
                                                        >
                                                            {role.role.name}
                                                        </span>
                                                    ))}
                                                    {orgUser.roles.length === 0 && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary font-medium">
                                                            Member
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {(!profile.organisations || profile.organisations.length === 0) &&
                                (!profile.organisationAdmins || profile.organisationAdmins.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Not a member of any organizations yet
                                    </p>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
