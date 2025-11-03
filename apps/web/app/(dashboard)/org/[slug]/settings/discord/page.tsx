"use client";

import { ChannelSelector } from "@/components/discord/ChannelSelector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import { AlertCircle, Bot, CheckCircle2, ExternalLink, Hash, Info, MessageSquare, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface DiscordConfig {
    id?: string;
    tenantId: string;
    botToken?: string;
    guildId?: string;
    guildName?: string;
    channelEvents?: string;
    channelMatches?: string;
    channelRoster?: string;
    channelIncidents?: string;
    channelGeneral?: string;
    enableChannelNotifications: boolean;
    enableUserDMs: boolean;
    enableEventNotifications: boolean;
    enableMatchNotifications: boolean;
    enableRosterNotifications: boolean;
    enableIncidentNotifications: boolean;
}

export default function DiscordSettingsPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [config, setConfig] = useState<DiscordConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state for channels
    const [channelEvents, setChannelEvents] = useState("");
    const [channelMatches, setChannelMatches] = useState("");
    const [channelRoster, setChannelRoster] = useState("");
    const [channelIncidents, setChannelIncidents] = useState("");
    const [channelGeneral, setChannelGeneral] = useState("");

    // Form state for bot
    const [botToken, setBotToken] = useState("");
    const [guildId, setGuildId] = useState("");

    // Form state for toggles
    const [enableEventNotifications, setEnableEventNotifications] = useState(false);
    const [enableMatchNotifications, setEnableMatchNotifications] = useState(false);
    const [enableRosterNotifications, setEnableRosterNotifications] = useState(false);
    const [enableIncidentNotifications, setEnableIncidentNotifications] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [slug]);

    const loadConfig = async () => {
        try {
            setIsLoading(true);
            const data = await apiGet<DiscordConfig>(`/org/${slug}/discord/config`);
            setConfig(data);

            // Populate form fields
            setChannelEvents(data.channelEvents || "");
            setChannelMatches(data.channelMatches || "");
            setChannelRoster(data.channelRoster || "");
            setChannelIncidents(data.channelIncidents || "");
            setChannelGeneral(data.channelGeneral || "");
            setGuildId(data.guildId || "");
            setEnableEventNotifications(data.enableEventNotifications);
            setEnableMatchNotifications(data.enableMatchNotifications);
            setEnableRosterNotifications(data.enableRosterNotifications);
            setEnableIncidentNotifications(data.enableIncidentNotifications);
        } catch (err: any) {
            if (err.message.includes('404')) {
                // No config yet, that's okay
                setConfig(null);
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveChannels = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            await apiPut(`/org/${slug}/discord/channels`, {
                channelEvents: channelEvents || null,
                channelMatches: channelMatches || null,
                channelRoster: channelRoster || null,
                channelIncidents: channelIncidents || null,
                channelGeneral: channelGeneral || null,
            });

            setSuccessMessage("Channel assignments saved successfully!");
            await loadConfig();
        } catch (err: any) {
            setError(err.message || "Failed to save channel assignments");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLinkBot = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            await apiPost(`/org/${slug}/discord/link`, {
                botToken,
                guildId,
            });

            setSuccessMessage("Discord bot linked successfully!");
            setBotToken(""); // Clear the token input for security
            await loadConfig();
        } catch (err: any) {
            setError(err.message || "Failed to link Discord bot");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSettings = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            await apiPut(`/org/${slug}/discord/settings`, {
                enableEventNotifications,
                enableMatchNotifications,
                enableRosterNotifications,
                enableIncidentNotifications,
            });

            setSuccessMessage("Notification settings updated!");
            await loadConfig();
        } catch (err: any) {
            setError(err.message || "Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestNotification = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            await apiPost(`/org/${slug}/discord/test`, {});

            setSuccessMessage("Test notification sent! Check your Discord server.");
        } catch (err: any) {
            setError(err.message || "Failed to send test notification");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUnlink = async () => {
        if (!confirm("Are you sure you want to unlink Discord? All settings will be removed.")) {
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            await apiDelete(`/org/${slug}/discord/unlink`);

            setSuccessMessage("Discord integration unlinked successfully!");
            setConfig(null);
            setBotToken("");
            setGuildId("");
            setChannelEvents("");
            setChannelMatches("");
            setChannelRoster("");
            setChannelIncidents("");
            setChannelGeneral("");
        } catch (err: any) {
            setError(err.message || "Failed to unlink Discord");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Setup Guide for New Users */}
            {!config?.guildName && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Getting Started with Discord Integration</AlertTitle>
                    <AlertDescription className="mt-2 space-y-2">
                        <p>Link your Discord bot to enable channel notifications and advanced features:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Channel Notifications:</strong> Bot posts rich embeds to designated channels</li>
                            <li><strong>User Verification:</strong> Link Discord accounts for personalized notifications</li>
                            <li><strong>Direct Messages:</strong> Send DMs to users for important updates</li>
                        </ul>
                        <div className="flex gap-2 mt-3">
                            <a
                                href="https://discord.com/developers/docs/intro"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                Bot Setup Guide <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Status Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {successMessage}
                </div>
            )}

            {/* Integration Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Discord Integration Status
                    </CardTitle>
                    <CardDescription>
                        Current status of your Discord integration
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {config?.guildName ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="default" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Connected
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm font-medium">Server:</span>
                                    <span className="text-sm text-muted-foreground">{config.guildName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm font-medium">Guild ID:</span>
                                    <span className="text-sm text-muted-foreground font-mono">{config.guildId}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm font-medium">Active Channels:</span>
                                    <span className="text-sm text-muted-foreground">
                                        {[config.channelEvents, config.channelMatches, config.channelRoster, config.channelIncidents, config.channelGeneral].filter(Boolean).length} configured
                                    </span>
                                </div>
                            </div>
                            <AppButton
                                variant="destructive"
                                onClick={handleUnlink}
                                disabled={isSaving}
                                className="mt-4"
                            >
                                Unlink Discord
                            </AppButton>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Not Connected
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                Configure webhooks or link a bot below to get started
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Channel Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        Channel Assignments
                    </CardTitle>
                    <CardDescription>
                        Select Discord channels where the bot will post notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!config?.guildName ? (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Bot Not Configured</AlertTitle>
                            <AlertDescription>
                                Link your Discord bot first to access channel selection. See the &quot;Discord Bot Configuration&quot; section below.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="channel-events">Events Channel</Label>
                                    {channelEvents && <Badge variant="secondary" className="text-xs">Configured</Badge>}
                                </div>
                                <ChannelSelector
                                    slug={slug}
                                    value={channelEvents}
                                    onChange={setChannelEvents}
                                    placeholder="Select events channel"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Notifications for event creation, updates, and cancellations
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="channel-matches">Matches Channel</Label>
                                    {channelMatches && <Badge variant="secondary" className="text-xs">Configured</Badge>}
                                </div>
                                <ChannelSelector
                                    slug={slug}
                                    value={channelMatches}
                                    onChange={setChannelMatches}
                                    placeholder="Select matches channel"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Notifications for game results and match reports
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="channel-roster">Roster Channel</Label>
                                    {channelRoster && <Badge variant="secondary" className="text-xs">Configured</Badge>}
                                </div>
                                <ChannelSelector
                                    slug={slug}
                                    value={channelRoster}
                                    onChange={setChannelRoster}
                                    placeholder="Select roster channel"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Notifications for roster changes and player updates
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="channel-incidents">Incidents Channel</Label>
                                    {channelIncidents && <Badge variant="secondary" className="text-xs">Configured</Badge>}
                                </div>
                                <ChannelSelector
                                    slug={slug}
                                    value={channelIncidents}
                                    onChange={setChannelIncidents}
                                    placeholder="Select incidents channel"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Notifications for incident reports and resolutions
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="channel-general">General Channel</Label>
                                    {channelGeneral && <Badge variant="secondary" className="text-xs">Configured</Badge>}
                                </div>
                                <ChannelSelector
                                    slug={slug}
                                    value={channelGeneral}
                                    onChange={setChannelGeneral}
                                    placeholder="Select general announcements channel"
                                />
                                <p className="text-xs text-muted-foreground">
                                    General announcements and updates
                                </p>
                            </div>

                            <AppButton
                                onClick={handleSaveChannels}
                                disabled={isSaving}
                                isLoading={isSaving}
                            >
                                Save Channel Assignments
                            </AppButton>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Bot Configuration */}
            {!config?.guildName && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            Discord Bot Configuration
                        </CardTitle>
                        <CardDescription>
                            Link your Discord bot to enable channel notifications and advanced features
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Setup Required</AlertTitle>
                            <AlertDescription>
                                You need to create a Discord bot in the Discord Developer Portal and invite it to your server before linking.
                                See our <a href="/docs/discord-bot-setup" className="underline" target="_blank" rel="noopener noreferrer">setup guide</a> for detailed instructions.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Label htmlFor="bot-token">Bot Token</Label>
                            <Input
                                id="bot-token"
                                type="password"
                                placeholder="Your Discord bot token"
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Get this from Discord Developer Portal → Bot section
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guild-id">Server ID (Guild ID)</Label>
                            <Input
                                id="guild-id"
                                type="text"
                                placeholder="Your Discord server ID"
                                value={guildId}
                                onChange={(e) => setGuildId(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Right-click your server in Discord and &quot;Copy Server ID&quot; (Developer Mode must be enabled)
                            </p>
                        </div>

                        <AppButton
                            onClick={handleLinkBot}
                            disabled={isSaving || !botToken || !guildId}
                            isLoading={isSaving}
                        >
                            Link Discord Bot
                        </AppButton>
                    </CardContent>
                </Card>
            )}

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Notification Settings
                    </CardTitle>
                    <CardDescription>
                        Choose which types of notifications to send to Discord
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="enable-events">Event Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Send notifications when events are created or updated
                            </p>
                        </div>
                        <Switch
                            id="enable-events"
                            checked={enableEventNotifications}
                            onCheckedChange={setEnableEventNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="enable-matches">Match Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Send notifications for game results and reports
                            </p>
                        </div>
                        <Switch
                            id="enable-matches"
                            checked={enableMatchNotifications}
                            onCheckedChange={setEnableMatchNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="enable-roster">Roster Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Send notifications for roster changes
                            </p>
                        </div>
                        <Switch
                            id="enable-roster"
                            checked={enableRosterNotifications}
                            onCheckedChange={setEnableRosterNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="enable-incidents">Incident Notifications</Label>
                            <p className="text-xs text-muted-foreground">
                                Send notifications for incident reports
                            </p>
                        </div>
                        <Switch
                            id="enable-incidents"
                            checked={enableIncidentNotifications}
                            onCheckedChange={setEnableIncidentNotifications}
                        />
                    </div>

                    <AppButton
                        onClick={handleUpdateSettings}
                        disabled={isSaving}
                        isLoading={isSaving}
                    >
                        Update Notification Settings
                    </AppButton>
                </CardContent>
            </Card>

            {/* Test Notification */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Integration</CardTitle>
                    <CardDescription>
                        Send a test notification to verify your bot and channel configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AppButton
                        onClick={handleTestNotification}
                        disabled={isSaving || !config?.guildName}
                        isLoading={isSaving}
                        variant="outline"
                    >
                        Send Test Notification
                    </AppButton>
                    {!config?.guildName && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Link your Discord bot first to test notifications
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
