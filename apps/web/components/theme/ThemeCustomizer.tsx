'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/context/ThemeContext';
import { ThemeConfig, defaultThemes } from '@/types/theme';
import { Download, Eye, Palette, RotateCcw, Save } from 'lucide-react';
import React, { useState } from 'react';

interface ThemeCustomizerProps {
    trigger?: React.ReactNode;
}

export function ThemeCustomizer({ trigger }: ThemeCustomizerProps) {
    const { currentTheme, saveTheme, resetToDefault, previewTheme, clearPreview } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [workingTheme, setWorkingTheme] = useState<ThemeConfig | null>(currentTheme);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'colors' | 'branding' | 'layout' | 'advanced'>('colors');

    React.useEffect(() => {
        if (currentTheme) {
            setWorkingTheme(currentTheme);
        }
    }, [currentTheme]);

    const handleColorChange = (path: string, value: string) => {
        if (!workingTheme) return;

        const keys = path.split('.');
        const updated = { ...workingTheme };
        let current: any = updated;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setWorkingTheme(updated);

        if (isPreviewMode) {
            previewTheme(updated);
        }
    };

    const handlePreviewToggle = () => {
        if (isPreviewMode) {
            clearPreview();
            setIsPreviewMode(false);
        } else {
            if (workingTheme) {
                previewTheme(workingTheme);
                setIsPreviewMode(true);
            }
        }
    };

    const handleSave = async () => {
        if (!workingTheme) return;

        try {
            await saveTheme(workingTheme);
            if (isPreviewMode) {
                setIsPreviewMode(false);
            }
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const handleLoadTemplate = (templateName: string) => {
        const template = defaultThemes[templateName];
        if (template && workingTheme) {
            const updated = { ...workingTheme, ...template };
            setWorkingTheme(updated);

            if (isPreviewMode) {
                previewTheme(updated);
            }
        }
    };

    const handleReset = () => {
        resetToDefault();
        setWorkingTheme(currentTheme);
        if (isPreviewMode) {
            setIsPreviewMode(false);
        }
    };

    const exportTheme = () => {
        if (!workingTheme) return;

        const dataStr = JSON.stringify(workingTheme, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `${workingTheme.organizationName || 'theme'}-config.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-2" />
            Customize Theme
        </Button>
    );

    const renderColorPicker = (label: string, path: string, value: string) => (
        <div className="flex items-center gap-3">
            <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ backgroundColor: value }}
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = value.startsWith('#') ? value : '#000000';
                    input.onchange = (e) => handleColorChange(path, (e.target as HTMLInputElement).value);
                    input.click();
                }}
            />
            <div className="flex-1">
                <Label>{label}</Label>
                <Input
                    value={value}
                    onChange={(e) => handleColorChange(path, e.target.value)}
                    placeholder="#000000"
                />
            </div>
        </div>
    );

    const renderTabContent = () => {
        if (!workingTheme) return null;

        switch (activeTab) {
            case 'colors':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="font-medium">Brand Colors</h3>
                                <div className="space-y-3">
                                    {renderColorPicker('Primary', 'primary', workingTheme.primary)}
                                    {renderColorPicker('Secondary', 'secondary', workingTheme.secondary)}
                                    {renderColorPicker('Accent', 'accent', workingTheme.accent)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium">Background Colors</h3>
                                <div className="space-y-3">
                                    {renderColorPicker('Background', 'background', workingTheme.background)}
                                    {renderColorPicker('Foreground', 'foreground', workingTheme.foreground)}
                                    {renderColorPicker('Muted', 'muted', workingTheme.muted)}
                                    {renderColorPicker('Muted Foreground', 'mutedForeground', workingTheme.mutedForeground)}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="font-medium">Border & Input Colors</h3>
                                <div className="space-y-3">
                                    {renderColorPicker('Border', 'border', workingTheme.border)}
                                    {renderColorPicker('Input', 'input', workingTheme.input)}
                                    {renderColorPicker('Ring', 'ring', workingTheme.ring)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium">Theme Templates</h3>
                                <div className="grid gap-2 grid-cols-2">
                                    {Object.entries(defaultThemes).map(([name, theme]) => (
                                        <Button
                                            key={name}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleLoadTemplate(name)}
                                            className="justify-start"
                                        >
                                            <div
                                                className="w-4 h-4 rounded mr-2"
                                                style={{ backgroundColor: theme.primary }}
                                            />
                                            {name.charAt(0).toUpperCase() + name.slice(1)}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'branding':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="orgName">Organization Name</Label>
                                    <Input
                                        id="orgName"
                                        value={workingTheme.organizationName}
                                        onChange={(e) => handleColorChange('organizationName', e.target.value)}
                                        placeholder="Your Organization Name"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        value={workingTheme.logo || ''}
                                        onChange={(e) => handleColorChange('logo', e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="favicon">Favicon URL</Label>
                                    <Input
                                        id="favicon"
                                        value={workingTheme.favicon || ''}
                                        onChange={(e) => handleColorChange('favicon', e.target.value)}
                                        placeholder="https://example.com/favicon.ico"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="fontFamily">Font Family</Label>
                                    <Input
                                        id="fontFamily"
                                        value={workingTheme.fontFamily}
                                        onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                                        placeholder="Inter, system-ui, sans-serif"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="headingFont">Heading Font (Optional)</Label>
                                    <Input
                                        id="headingFont"
                                        value={workingTheme.headingFont || ''}
                                        onChange={(e) => handleColorChange('headingFont', e.target.value)}
                                        placeholder="Leave empty to use main font"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'layout':
                return (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="sidebarStyle">Sidebar Style</Label>
                                <Select
                                    value={workingTheme.sidebarStyle}
                                    onValueChange={(value) => handleColorChange('sidebarStyle', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="compact">Compact</SelectItem>
                                        <SelectItem value="modern">Modern</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="headerStyle">Header Style</Label>
                                <Select
                                    value={workingTheme.headerStyle}
                                    onValueChange={(value) => handleColorChange('headerStyle', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                        <SelectItem value="branded">Branded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 'advanced':
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="customCss">Custom CSS</Label>
                            <Textarea
                                id="customCss"
                                value={workingTheme.customCss || ''}
                                onChange={(e) => handleColorChange('customCss', e.target.value)}
                                placeholder="/* Add your custom CSS here */"
                                rows={10}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!workingTheme) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme Customizer
                    </DialogTitle>
                </DialogHeader>

                {/* Simple Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    {[
                        { key: 'colors', label: 'Colors' },
                        { key: 'branding', label: 'Branding' },
                        { key: 'layout', label: 'Layout' },
                        { key: 'advanced', label: 'Advanced' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {renderTabContent()}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePreviewToggle}
                            size="sm"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {isPreviewMode ? 'Stop Preview' : 'Preview'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportTheme}
                            size="sm"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            size="sm"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Theme
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}