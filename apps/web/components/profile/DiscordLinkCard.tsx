'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api/config';
import { AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DiscordLinkData {
    id: string;
    discordId: string;
    username: string;
    discriminator?: string;
    avatar?: string;
    enableDMs: boolean;
    dmEvents: boolean;
    dmMatches: boolean;
    dmRoster: boolean;
    dmIncidents: boolean;
    dmPersonalOnly: boolean;
    createdAt: string;
}

export function DiscordLinkCard() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isLinking, setIsLinking] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [discordLink, setDiscordLink] = useState<DiscordLinkData | null>(null);

    // Preferences state
    const [preferences, setPreferences] = useState({
        enableDMs: true,
        dmEvents: false,
        dmMatches: false,
        dmRoster: false,
        dmIncidents: false,
        dmPersonalOnly: true,
    });

    useEffect(() => {
        loadDiscordLink();
    }, []);

    const loadDiscordLink = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(getApiUrl('/user/discord/link'), {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setDiscordLink(data);
                setPreferences({
                    enableDMs: data.enableDMs,
                    dmEvents: data.dmEvents,
                    dmMatches: data.dmMatches,
                    dmRoster: data.dmRoster,
                    dmIncidents: data.dmIncidents,
                    dmPersonalOnly: data.dmPersonalOnly,
                });
            } else if (response.status === 404) {
                // Not linked yet
                setDiscordLink(null);
            }
        } catch (error) {
            console.error('Failed to load Discord link:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkDiscord = async () => {
        try {
            setIsLinking(true);
            // Save current path to return to after OAuth
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('discord_return_path', window.location.pathname);
            }
            // Redirect to backend OAuth endpoint which will redirect to Discord
            window.location.href = getApiUrl('/user/discord/auth');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to initiate Discord linking',
            });
            setIsLinking(false);
        }
    };

    const handleUnlink = async () => {
        if (!confirm('Are you sure you want to unlink your Discord account?')) {
            return;
        }

        try {
            setIsUnlinking(true);
            const response = await fetch(getApiUrl('/user/discord/link'), {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Discord account unlinked successfully',
                });
                setDiscordLink(null);
            } else {
                throw new Error('Failed to unlink');
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to unlink Discord account',
            });
        } finally {
            setIsUnlinking(false);
        }
    };

    const handleSavePreferences = async () => {
        try {
            setIsSaving(true);
            const response = await fetch(getApiUrl('/user/discord/preferences'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                const updated = await response.json();
                setDiscordLink({ ...discordLink!, ...updated });
                toast({
                    title: 'Success',
                    description: 'Preferences saved successfully',
                });
            } else {
                throw new Error('Failed to save preferences');
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save preferences',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getDiscordAvatarUrl = () => {
        if (!discordLink || !discordLink.avatar) return null;
        return `https://cdn.discordapp.com/avatars/${discordLink.discordId}/${discordLink.avatar}.png`;
    };

    const getDiscordUsername = () => {
        if (!discordLink) return '';
        if (discordLink.discriminator && discordLink.discriminator !== '0') {
            return `${discordLink.username}#${discordLink.discriminator}`;
        }
        return discordLink.username;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Discord Integration
                    </CardTitle>
                    <CardDescription>
                        Link your Discord account to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Discord Integration
                </CardTitle>
                <CardDescription>
                    Link your Discord account to receive direct message notifications
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!discordLink ? (
                    // Not linked
                    <div className="space-y-4">
                        <div className="flex items-start gap-2 p-4 border border-border rounded-lg bg-muted/50">
                            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Not Connected</p>
                                <p className="text-sm text-muted-foreground">
                                    Link your Discord account to receive personalized notifications about events,
                                    matches, roster changes, and incidents directly in your DMs.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleLinkDiscord}
                            disabled={isLinking}
                            className="w-full sm:w-auto"
                            style={{ backgroundColor: '#5865F2' }}
                        >
                            {isLinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Link Discord Account
                        </Button>
                    </div>
                ) : (
                    // Linked
                    <div className="space-y-6">
                        {/* Discord Account Info */}
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center gap-3">
                                {getDiscordAvatarUrl() ? (
                                    <Image
                                        src={getDiscordAvatarUrl()!}
                                        alt="Discord Avatar"
                                        width={48}
                                        height={48}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-[#5865F2] flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{getDiscordUsername()}</p>
                                    <Badge variant="secondary" className="mt-1">
                                        Connected
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnlink}
                                disabled={isUnlinking}
                            >
                                {isUnlinking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Unlink
                            </Button>
                        </div>

                        {/* DM Preferences */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Direct Message Preferences</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Choose which notifications you want to receive via Discord DM
                                </p>
                            </div>

                            {/* Master Toggle */}
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-medium">Enable Direct Messages</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Master toggle for all Discord notifications
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.enableDMs}
                                    onCheckedChange={(checked) =>
                                        setPreferences({ ...preferences, enableDMs: checked })
                                    }
                                />
                            </div>

                            {/* Individual Preferences */}
                            <div className="space-y-3 ml-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>📅 Event Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            When you're assigned to events
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.dmEvents}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, dmEvents: checked })
                                        }
                                        disabled={!preferences.enableDMs}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>🏆 Match Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            When you participate in matches
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.dmMatches}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, dmMatches: checked })
                                        }
                                        disabled={!preferences.enableDMs}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>👥 Roster Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            When roster changes affect you
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.dmRoster}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, dmRoster: checked })
                                        }
                                        disabled={!preferences.enableDMs}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>🚨 Incident Notifications</Label>
                                        <p className="text-xs text-muted-foreground">
                                            When you're mentioned in incidents
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.dmIncidents}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, dmIncidents: checked })
                                        }
                                        disabled={!preferences.enableDMs}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="space-y-0.5">
                                        <Label>👤 Personal Only Mode</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Only receive DMs when directly mentioned or assigned
                                        </p>
                                    </div>
                                    <Switch
                                        checked={preferences.dmPersonalOnly}
                                        onCheckedChange={(checked) =>
                                            setPreferences({ ...preferences, dmPersonalOnly: checked })
                                        }
                                        disabled={!preferences.enableDMs}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSavePreferences}
                                disabled={isSaving}
                                className="w-full sm:w-auto"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Preferences
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
