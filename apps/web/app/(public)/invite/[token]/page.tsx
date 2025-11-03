'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, getServerUrl } from '@/lib/api/config';
import { AlertCircle, Building2, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface InviteInfo {
    organizationName: string;
    organizationSlug: string;
    organizationLogo?: string;
    roles: string[];
    email?: string;
    expiresAt: string;
    isValid: boolean;
}

export default function InviteAcceptPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const token = params?.token as string;

    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchInviteInfo();
    }, [token]);

    const fetchInviteInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(getApiUrl(`/invite/${token}/info`), {
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch invite information');
            }

            const data = await response.json();
            setInviteInfo(data);

            // Pre-fill email if provided
            if (data.email) {
                setFormData(prev => ({ ...prev, email: data.email }));
            }
        } catch (err: any) {
            console.error('Failed to fetch invite info:', err);
            setError(err.message || 'Failed to load invite information');
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else {
            // Password complexity checks (sync with server-side rules)
            const checks: string[] = [];
            if (formData.password.length < 8) checks.push('at least 8 characters');
            if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password)) checks.push('uppercase and lowercase letters');
            if (!/\d/.test(formData.password)) checks.push('at least one number');
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) checks.push('at least one special character');
            if (checks.length > 0) {
                errors.password = `Password must include ${checks.join(', ')}`;
            }
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(getApiUrl(`/invite/${token}/register`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();

            // Show success state
            setIsSuccess(true);

            // Show success message
            toast({
                title: "Account created successfully!",
                description: `Welcome to ${inviteInfo?.organizationName}! You can now log in.`,
            });

            // Redirect to login page with org slug pre-filled
            setTimeout(() => {
                router.push(`/login?org=${inviteInfo?.organizationSlug}`);
            }, 2000);

        } catch (err: any) {
            console.error('Registration failed:', err);
            toast({
                title: "Registration failed",
                description: err.message || "Failed to complete registration",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Loading invitation...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4 mx-auto">
                            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-center">Account Created Successfully!</CardTitle>
                        <CardDescription className="text-center">
                            Welcome to {inviteInfo?.organizationName}! Redirecting you to login...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !inviteInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 mx-auto">
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <CardTitle className="text-center">Invalid Invitation</CardTitle>
                        <CardDescription className="text-center">
                            {error || 'This invitation link is invalid or has expired.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            onClick={() => router.push('/login')}
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!inviteInfo.isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4 mx-auto">
                            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <CardTitle className="text-center">Invitation Expired</CardTitle>
                        <CardDescription className="text-center">
                            This invitation has expired or has already been used.
                            Please contact the organization administrator for a new invitation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            onClick={() => router.push('/login')}
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    {/* Organization Info */}
                    <div className="flex items-center gap-4 pb-4 border-b">
                        {inviteInfo.organizationLogo ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white border">
                                <Image
                                    src={inviteInfo.organizationLogo.startsWith('/')
                                        ? `${getServerUrl()}${inviteInfo.organizationLogo}`
                                        : inviteInfo.organizationLogo}
                                    alt={inviteInfo.organizationName}
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="font-semibold text-lg">{inviteInfo.organizationName}</h2>
                            <p className="text-sm text-muted-foreground">You've been invited to join</p>
                        </div>
                    </div>

                    <div>
                        <CardTitle>Create Your Account</CardTitle>
                        <CardDescription>
                            Complete your registration to join this organization
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Roles being granted */}
                        {inviteInfo.roles.length > 0 && (
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Roles: {inviteInfo.roles.join(', ')}
                                        </p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            You'll be granted these roles upon registration
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    setValidationErrors({ ...validationErrors, name: '' });
                                }}
                                className={validationErrors.name ? 'border-red-500' : ''}
                            />
                            {validationErrors.name && (
                                <p className="text-sm text-red-500">{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    setValidationErrors({ ...validationErrors, email: '' });
                                }}
                                disabled={!!inviteInfo.email}
                                className={validationErrors.email ? 'border-red-500' : ''}
                            />
                            {inviteInfo.email && (
                                <p className="text-xs text-muted-foreground">
                                    This email was specified in your invitation
                                </p>
                            )}
                            {validationErrors.email && (
                                <p className="text-sm text-red-500">{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    setValidationErrors({ ...validationErrors, password: '' });
                                }}
                                className={validationErrors.password ? 'border-red-500' : ''}
                            />
                            <PasswordStrengthIndicator password={formData.password} />
                            {validationErrors.password && (
                                <p className="text-sm text-red-500">{validationErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value });
                                    setValidationErrors({ ...validationErrors, confirmPassword: '' });
                                }}
                                className={validationErrors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {validationErrors.confirmPassword && (
                                <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Create Account & Join
                                </>
                            )}
                        </Button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <a href="/login" className="text-primary hover:underline">
                                Sign in
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
