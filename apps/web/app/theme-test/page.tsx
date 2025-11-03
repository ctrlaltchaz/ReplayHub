'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeTestPage() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading theme...</div>;
    }

    return (
        <div className="min-h-screen p-8 bg-background text-foreground">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Theme Debug Page</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-card text-card-foreground rounded-lg border">
                        <h2 className="text-xl font-semibold mb-2">Theme Info</h2>
                        <p><strong>Current theme:</strong> {theme}</p>
                        <p><strong>Resolved theme:</strong> {resolvedTheme}</p>
                        <p><strong>HTML class:</strong> {document?.documentElement?.className || 'Not available'}</p>
                    </div>

                    <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Theme Controls</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => setTheme('dark')}
                                className="block w-full p-2 bg-primary text-primary-foreground rounded"
                            >
                                Set Dark
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className="block w-full p-2 bg-primary text-primary-foreground rounded"
                            >
                                Set Light
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className="block w-full p-2 bg-primary text-primary-foreground rounded"
                            >
                                Set System
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Color Test</h2>
                    <p>This text should change color based on the theme.</p>
                    <p>Background: bg-background, Foreground: text-foreground</p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">CSS Variables</h2>
                    <div className="text-sm font-mono">
                        <p>--background: <span style={{ color: 'hsl(var(--background))' }}>{getComputedStyle(document.documentElement).getPropertyValue('--background')}</span></p>
                        <p>--foreground: <span style={{ color: 'hsl(var(--foreground))' }}>{getComputedStyle(document.documentElement).getPropertyValue('--foreground')}</span></p>
                        <p>--card: {getComputedStyle(document.documentElement).getPropertyValue('--card')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}