'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { useThemePresets } from '@/hooks/useThemePresets';
import { getApiUrl, getServerUrl } from '@/lib/api/config';
import { hasPermission } from '@/lib/permissions/utils';
import type { ThemePreset } from '@/lib/types/organization';
import { Building2, Check, Globe, Image as ImageIcon, Palette, Save, Settings, Sparkles, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

interface Organization {
    id: string;
    slug: string;
    name: string;
    branding: {
        logo?: string;
        logoUrl?: string;
        theme?: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
        backgroundColor?: string;
        sidebarColor?: string;
        textColor?: string;
    } | null;
}

export default function OrganizationSettingsPage() {
    const params = useParams();
    const { toast } = useToast();
    const { permissions } = useAuth();
    const { refetch: refetchOrganization } = useOrganization();
    const orgSlug = params?.slug as string;

    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { presets, isLoading: presetsLoading } = useThemePresets(orgSlug);

    // Check permissions
    const canManageSettings = hasPermission(permissions, 'org.settings.manage');
    const canViewSettings = hasPermission(permissions, 'org.settings.view');

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        theme: '',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#06b6d4',
        backgroundColor: '#ffffff',
        sidebarColor: '#f8fafc',
        textColor: '#0f172a',
    });

    // Fetch organization details on mount
    React.useEffect(() => {
        fetchOrganization();
    }, [orgSlug]);

    const fetchOrganization = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(getApiUrl(`/org/${orgSlug}/profile`), {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch organization details');
            }

            const data = await response.json();
            setOrganization(data.organization);

            const branding = data.organization.branding || {};
            setFormData({
                name: data.organization.name || '',
                logo: branding.logo || branding.logoUrl || '',
                theme: branding.theme || '',
                primaryColor: branding.primaryColor || '#6366f1',
                secondaryColor: branding.secondaryColor || '#8b5cf6',
                accentColor: branding.accentColor || '#06b6d4',
                backgroundColor: branding.backgroundColor || '#ffffff',
                sidebarColor: branding.sidebarColor || '#f8fafc',
                textColor: branding.textColor || '#0f172a',
            });
            setSelectedPreset(branding.theme || null);
        } catch (err) {
            console.error('Failed to fetch organization:', err);
            setFormData({
                name: orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1),
                logo: '',
                theme: '',
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                accentColor: '#06b6d4',
                backgroundColor: '#ffffff',
                sidebarColor: '#f8fafc',
                textColor: '#0f172a',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePresetSelect = (preset: ThemePreset) => {
        setSelectedPreset(preset.name);
        setFormData({
            ...formData,
            theme: preset.name,
            primaryColor: preset.colors.primaryColor,
            secondaryColor: preset.colors.secondaryColor,
            accentColor: preset.colors.accentColor,
            backgroundColor: preset.colors.backgroundColor,
            sidebarColor: preset.colors.sidebarColor,
            textColor: preset.colors.textColor,
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid file',
                    description: 'Please select an image file',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Logo must be less than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            setLogoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadLogo = async () => {
        if (!logoFile) return;

        try {
            setIsUploadingLogo(true);

            const formData = new FormData();
            formData.append('file', logoFile);

            const response = await fetch(getApiUrl(`/org/${orgSlug}/profile/logo`), {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to upload logo');
            }

            const data = await response.json();

            toast({
                title: 'Logo uploaded',
                description: 'Organization logo has been updated successfully.',
            });

            // Refresh organization data
            await fetchOrganization();
            await refetchOrganization();

            // Clear file selection
            setLogoFile(null);
            setLogoPreview(null);
        } catch (err: any) {
            console.error('Failed to upload logo:', err);
            toast({
                title: 'Error',
                description: err.message || 'Failed to upload logo',
                variant: 'destructive',
            });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSaving(true);

            const updateData = {
                name: formData.name,
                branding: {
                    logo: formData.logo,
                    logoUrl: formData.logo,
                    theme: formData.theme,
                    primaryColor: formData.primaryColor,
                    secondaryColor: formData.secondaryColor,
                    accentColor: formData.accentColor,
                    backgroundColor: formData.backgroundColor,
                    sidebarColor: formData.sidebarColor,
                    textColor: formData.textColor,
                },
            };

            const response = await fetch(getApiUrl(`/org/${orgSlug}/profile`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update organization');
            }

            toast({
                title: 'Settings saved',
                description: 'Organization settings have been updated successfully.',
            });

            // Refresh local state and context
            await fetchOrganization();
            await refetchOrganization();
        } catch (err: any) {
            console.error('Failed to save settings:', err);
            toast({
                title: 'Error',
                description: err.message || 'Failed to save organization settings',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading organization settings...</p>
            </div>
        );
    }

    if (!canViewSettings) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">Access Denied</p>
                    <p className="text-muted-foreground">You don't have permission to view organization settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="px-1">
                <h2 className="text-2xl font-bold tracking-tight">Organization Settings</h2>
                <p className="text-muted-foreground">
                    Manage your organization's profile and branding
                    {!canManageSettings && (
                        <span className="block text-yellow-600 dark:text-yellow-500 mt-1">
                            ⚠️ You have view-only access. Contact an admin to make changes.
                        </span>
                    )}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            <CardTitle>Basic Information</CardTitle>
                        </div>
                        <CardDescription>
                            General information about your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-slug">
                                Organization Slug <span className="text-muted-foreground">(read-only)</span>
                            </Label>
                            <Input
                                id="org-slug"
                                value={orgSlug}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                The unique identifier used in URLs for your organization
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="org-name">
                                Organization Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="org-name"
                                placeholder="My Organization"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!canManageSettings}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Branding */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Branding & Theme</CardTitle>
                        </div>
                        <CardDescription>
                            Customize the look and feel of your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Logo Upload */}
                        <div className="space-y-3">
                            <Label>Organization Logo</Label>

                            {/* Current Logo Display */}
                            {(formData.logo || logoPreview) && (
                                <div className="flex items-start gap-4 p-4 border rounded-lg">
                                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                        <Image
                                            src={logoPreview || (formData.logo?.startsWith('/')
                                                ? `${getServerUrl()}${formData.logo}`
                                                : formData.logo)}
                                            alt="Organization logo"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            {logoFile ? 'New logo selected' : 'Current logo'}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {logoFile ? logoFile.name : formData.logo}
                                        </p>
                                        {logoFile && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Size: {(logoFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        )}
                                    </div>
                                    {logoFile && canManageSettings && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveLogo}
                                            className="flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Upload Controls */}
                            {canManageSettings && (
                                <div className="flex gap-2">
                                    <Input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="logo-upload"
                                        className="flex-1 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-center gap-2 h-10 px-4 border rounded-md hover:bg-accent transition-colors">
                                            <ImageIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {formData.logo ? 'Change Logo' : 'Select Logo'}
                                            </span>
                                        </div>
                                    </Label>
                                    {logoFile && (
                                        <Button
                                            type="button"
                                            onClick={handleUploadLogo}
                                            disabled={isUploadingLogo}
                                        >
                                            {isUploadingLogo ? (
                                                'Uploading...'
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Supported formats: JPG, PNG, GIF, WebP, SVG. Max size: 5MB
                            </p>
                        </div>

                        {/* Theme Presets */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                <Label>Theme Presets</Label>
                            </div>
                            {presetsLoading ? (
                                <p className="text-sm text-muted-foreground">Loading themes...</p>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => handlePresetSelect(preset)}
                                            disabled={!canManageSettings}
                                            className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedPreset === preset.name
                                                ? 'border-primary shadow-md'
                                                : 'border-border hover:border-primary/50'
                                                } ${!canManageSettings ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
                                        >
                                            {selectedPreset === preset.name && (
                                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <div className="flex gap-1 h-8">
                                                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.primaryColor }} />
                                                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.secondaryColor }} />
                                                    <div className="flex-1 rounded" style={{ backgroundColor: preset.colors.accentColor }} />
                                                </div>
                                                <div className="text-sm font-medium">{preset.label}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2">{preset.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Custom Colors */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Custom Colors (Override Preset)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary-color" className="text-xs">Primary</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="primary-color"
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.primaryColor}
                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#6366f1"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secondary-color" className="text-xs">Secondary</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="secondary-color"
                                            type="color"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.secondaryColor}
                                            onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#8b5cf6"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="accent-color" className="text-xs">Accent</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="accent-color"
                                            type="color"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.accentColor}
                                            onChange={(e) => setFormData({ ...formData, accentColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#06b6d4"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="background-color" className="text-xs">Background</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="background-color"
                                            type="color"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.backgroundColor}
                                            onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#ffffff"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sidebar-color" className="text-xs">Sidebar</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="sidebar-color"
                                            type="color"
                                            value={formData.sidebarColor}
                                            onChange={(e) => setFormData({ ...formData, sidebarColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.sidebarColor}
                                            onChange={(e) => setFormData({ ...formData, sidebarColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#f8fafc"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="text-color" className="text-xs">Text</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="text-color"
                                            type="color"
                                            value={formData.textColor}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            className="w-16 h-10 p-1"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.textColor}
                                            onChange={(e) => setFormData({ ...formData, textColor: e.target.value, theme: '' })}
                                            disabled={!canManageSettings}
                                            placeholder="#0f172a"
                                            className="flex-1 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Modifying colors manually will override the selected preset
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            <CardTitle>Advanced Settings</CardTitle>
                        </div>
                        <CardDescription>
                            Additional configuration options
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-muted p-4">
                            <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium">Organization Status</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your organization is currently <strong>active</strong>.
                                        Contact support to deactivate or transfer ownership.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving || !formData.name || !canManageSettings}>
                        {isSaving ? (
                            'Saving...'
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
