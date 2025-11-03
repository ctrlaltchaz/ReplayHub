'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import { useOrgLogin } from '@/lib/auth/api';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface OrgLoginFormProps {
    slug: string;
}

export function OrgLoginForm({ slug }: OrgLoginFormProps) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const loginMutation = useOrgLogin(slug, {
        onSuccess: () => {
            // Redirect to the org dashboard after successful login
            router.push(`/org/${slug}/dashboard`);
        },
        onError: (error: any) => {
            const message = error?.message || 'Login failed. Please check your credentials.';
            if (message.includes('fetch') || message.includes('network')) {
                setError('Unable to connect to server. Please check your connection and try again.');
            } else if (error?.status === 401 || error?.status === 403) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(message);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        // Use the actual API
        loginMutation.mutate({ email, password });
    }; const handleTestCredentials = (testEmail: string, testPassword: string) => {
        setEmail(testEmail);
        setPassword(testPassword);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loginMutation.isPending}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loginMutation.isPending}
                        required
                    />
                </div>

                {error && (
                    <Alert variant="destructive">
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>

            {/* Test Credentials Section */}
            <div className="rounded-lg border bg-muted/50 p-4">
                <h3 className="text-sm font-medium mb-3">Test Credentials</h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between bg-background p-3 rounded border text-sm">
                        <div>
                            <div className="font-medium">Admin Account</div>
                            <div className="text-muted-foreground">admin@testorg.com</div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestCredentials('admin@testorg.com', 'TestPassword123!')}
                            disabled={loginMutation.isPending}
                        >
                            Use
                        </Button>
                    </div>

                    <div className="flex items-center justify-between bg-background p-3 rounded border text-sm">
                        <div>
                            <div className="font-medium">Manager Account</div>
                            <div className="text-muted-foreground">manager@testorg.com</div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestCredentials('manager@testorg.com', 'TestPassword123!')}
                            disabled={loginMutation.isPending}
                        >
                            Use
                        </Button>
                    </div>

                    <div className="flex items-center justify-between bg-background p-3 rounded border text-sm">
                        <div>
                            <div className="font-medium">User Account</div>
                            <div className="text-muted-foreground">user@testorg.com</div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestCredentials('user@testorg.com', 'TestPassword123!')}
                            disabled={loginMutation.isPending}
                        >
                            Use
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                    Click &quot;Use&quot; to auto-fill credentials, then click &quot;Sign In&quot;
                    <br />
                    <span className="text-emerald-600">✓ Connected to backend API</span>
                </p>
            </div>
        </div>
    );
}