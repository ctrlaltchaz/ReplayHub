"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { apiGet, apiPut } from "@/lib/api/client";
import {
    BarChart3,
    BookOpen,
    Calendar,
    ExternalLink,
    FileText,
    Globe,
    GripVertical,
    Heart,
    Home,
    Image,
    Link2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Plus,
    Settings,
    Shield,
    Star,
    Trash2,
    Users,
    Video,
    Zap
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface QuickLink {
    label: string;
    url: string;
    icon?: string;
    openInNewTab: boolean;
}

// Popular icon options from lucide-react
const ICON_OPTIONS = [
    { value: "Link2", label: "Link" },
    { value: "ExternalLink", label: "External Link" },
    { value: "Home", label: "Home" },
    { value: "FileText", label: "Document" },
    { value: "Users", label: "Users" },
    { value: "Calendar", label: "Calendar" },
    { value: "Settings", label: "Settings" },
    { value: "BarChart3", label: "Chart" },
    { value: "MessageSquare", label: "Message" },
    { value: "BookOpen", label: "Book" },
    { value: "Video", label: "Video" },
    { value: "Image", label: "Image" },
    { value: "Globe", label: "Globe" },
    { value: "Mail", label: "Email" },
    { value: "Phone", label: "Phone" },
    { value: "MapPin", label: "Location" },
    { value: "Star", label: "Star" },
    { value: "Heart", label: "Heart" },
    { value: "Shield", label: "Shield" },
    { value: "Zap", label: "Lightning" },
];

// Icon component mapping
const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
    Link2,
    ExternalLink,
    Home,
    FileText,
    Users,
    Calendar,
    Settings,
    BarChart3,
    MessageSquare,
    BookOpen,
    Video,
    Image,
    Globe,
    Mail,
    Phone,
    MapPin,
    Star,
    Heart,
    Shield,
    Zap,
};

export default function QuickLinksPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        loadQuickLinks();
    }, [slug]);

    const loadQuickLinks = async () => {
        try {
            setIsLoading(true);
            const data = await apiGet<{ quickLinks: QuickLink[] }>(`/org/${slug}/profile/quick-links`);
            setQuickLinks(data.quickLinks || []);
        } catch (error) {
            console.error('Failed to load quick links:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load quick links',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await apiPut(`/org/${slug}/profile/quick-links`, { quickLinks });
            toast({
                title: 'Success',
                description: 'Quick links saved successfully',
            });
            // Refresh the page to update sidebar
            window.location.reload();
        } catch (error) {
            console.error('Failed to save quick links:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save quick links',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const addQuickLink = () => {
        if (quickLinks.length >= 10) {
            toast({
                variant: 'destructive',
                title: 'Limit Reached',
                description: 'You can have a maximum of 10 quick links',
            });
            return;
        }

        setQuickLinks([
            ...quickLinks,
            {
                label: '',
                url: '',
                icon: 'Link2',
                openInNewTab: true,
            },
        ]);
    };

    const removeQuickLink = (index: number) => {
        setQuickLinks(quickLinks.filter((_, i) => i !== index));
    };

    const updateQuickLink = (index: number, field: keyof QuickLink, value: string | boolean) => {
        const updated = [...quickLinks];
        updated[index] = { ...updated[index], [field]: value };
        setQuickLinks(updated);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...quickLinks];
        const draggedItem = updated[draggedIndex];
        updated.splice(draggedIndex, 1);
        updated.splice(index, 0, draggedItem);

        setQuickLinks(updated);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Quick Links</h1>
                    <p className="text-muted-foreground mt-2">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quick Links</h1>
                <p className="text-muted-foreground mt-2">
                    Manage custom links that appear in the sidebar for all organization members
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sidebar Quick Links</CardTitle>
                    <CardDescription>
                        Add up to 10 custom links. Drag to reorder. These will appear in a collapsible section in the sidebar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {quickLinks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No quick links configured</p>
                            <p className="text-sm">Click the button below to add your first link</p>
                        </div>
                    )}

                    {quickLinks.map((link, index) => (
                        <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-move"
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground mt-2 shrink-0" />

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`label-${index}`}>Label *</Label>
                                    <Input
                                        id={`label-${index}`}
                                        value={link.label}
                                        onChange={(e) => updateQuickLink(index, 'label', e.target.value)}
                                        placeholder="e.g., Discord Server"
                                        maxLength={50}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`url-${index}`}>URL *</Label>
                                    <Input
                                        id={`url-${index}`}
                                        value={link.url}
                                        onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                                        placeholder="https://example.com"
                                        type="url"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`icon-${index}`}>Icon</Label>
                                    <Select
                                        value={link.icon || 'Link2'}
                                        onValueChange={(value) => updateQuickLink(index, 'icon', value)}
                                    >
                                        <SelectTrigger id={`icon-${index}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ICON_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`newTab-${index}`}>Open in New Tab</Label>
                                    <div className="flex items-center gap-2 h-10">
                                        <Switch
                                            id={`newTab-${index}`}
                                            checked={link.openInNewTab}
                                            onCheckedChange={(checked) => updateQuickLink(index, 'openInNewTab', checked)}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            {link.openInNewTab ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <AppButton
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuickLink(index)}
                                className="text-destructive hover:bg-destructive/10 shrink-0 mt-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </AppButton>
                        </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t">
                        <AppButton
                            variant="outline"
                            onClick={addQuickLink}
                            disabled={quickLinks.length >= 10}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Quick Link
                        </AppButton>

                        <AppButton
                            onClick={handleSave}
                            disabled={isSaving || quickLinks.some(link => !link.label || !link.url)}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </AppButton>
                    </div>

                    {quickLinks.some(link => !link.label || !link.url) && (
                        <p className="text-sm text-destructive">
                            * All quick links must have a label and URL before saving
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                        How your quick links will appear in the sidebar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {quickLinks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No quick links to preview</p>
                    ) : (
                        <div className="space-y-2 max-w-xs">
                            {quickLinks.map((link, index) => {
                                const IconComponent = link.icon && iconComponents[link.icon]
                                    ? iconComponents[link.icon]
                                    : Link2;

                                const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <IconComponent className="h-4 w-4 shrink-0" />
                                        <span className="text-sm truncate">{link.label || 'Untitled'}</span>
                                        {isExternal && link.openInNewTab && (
                                            <ExternalLink className="h-3 w-3 ml-auto shrink-0 text-muted-foreground" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
