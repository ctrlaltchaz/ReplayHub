"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api/client";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense, useState } from "react";

interface UnifiedOrgMembership {
    orgUserId: string;
    tenantId: string;
    tenantSlug: string;
    tenantName: string;
    email: string;
    displayName: string | null;
    isActive: boolean;
    isTotpEnabled: boolean;
}

interface UnifiedUserProfile {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    hasGlobalAccount: boolean;
    isGlobalAdmin: boolean;
    isActive: boolean;
    isTotpEnabled: boolean;
    globalOrganisations: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    memberships: UnifiedOrgMembership[];
    activeMembership?: UnifiedOrgMembership;
}

interface UniversalLoginResponse {
    success: boolean;
    userType: 'global' | 'org' | 'both';
    message: string;
    requiresTotp?: boolean;
    user?: UnifiedUserProfile;
    globalUser?: {
        id: string;
        email: string;
        isGlobalAdmin: boolean;
        organizations?: Array<{
            id: string;
            name: string;
            slug: string;
        }>;
    };
    orgAccounts?: Array<{
        id: string;
        tenantSlug: string;
        tenantName: string;
        email: string;
    }>;
}

interface TotpVerifyRequest {
    token: string;
    userType: 'global' | 'org';
    tenantSlug?: string;
}

function mapLegacyOrgAccounts(accounts: UniversalLoginResponse['orgAccounts'] | undefined): UnifiedOrgMembership[] {
    return (accounts ?? []).map((account) => ({
        orgUserId: account.id,
        tenantId: '',
        tenantSlug: account.tenantSlug,
        tenantName: account.tenantName,
        email: account.email,
        displayName: null,
        isActive: true,
        isTotpEnabled: false,
    }));
}

function extractMemberships(response?: UniversalLoginResponse | null): UnifiedOrgMembership[] {
    if (!response) {
        return [];
    }

    if (response.user?.memberships) {
        return response.user.memberships;
    }

    return mapLegacyOrgAccounts(response.orgAccounts);
}

function UniversalLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refresh, globalUser, isLoadingGlobal } = useAuth();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    // UI state
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [requiresTotp, setRequiresTotp] = useState(false);
    const [loginResponse, setLoginResponse] = useState<UniversalLoginResponse | null>(null);
    const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

    // Check if user is already logged in and redirect
    React.useEffect(() => {
        if (!isLoadingGlobal && globalUser) {
            // User is already logged in, redirect them
            const redirectTo = searchParams?.get('redirect');

            if (redirectTo && redirectTo.startsWith('/')) {
                router.push(redirectTo);
            } else if (globalUser.isGlobalAdmin) {
                router.push('/admin/control-center');
            } else {
                router.push('/org/select');
            }
        }
    }, [authLoading, globalUser, router, searchParams]);

    const membershipOptions = React.useMemo(() => extractMemberships(loginResponse), [loginResponse]);
    const loginResponseHasGlobal = loginResponse?.user?.hasGlobalAccount ?? (loginResponse?.userType === 'global' || loginResponse?.userType === 'both');
    const shouldShowOrgSelection = Boolean(!requiresTotp && loginResponse && membershipOptions.length > 1 && !loginResponseHasGlobal);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Call unified login endpoint
            const data: UniversalLoginResponse = await apiPost('/auth/universal-login', {
                email,
                password,
                rememberMe
            });

            setLoginResponse(data);

            // Check if TOTP is required
            if (data.requiresTotp) {
                setSuccessMessage("Credentials verified! Please enter your 2FA code.");
                setRequiresTotp(true);
                setIsLoading(false);
                return;
            }

            // Show success message briefly before redirect
            setSuccessMessage("Login successful! Redirecting...");

            // Handle successful login based on user type
            await handleLoginSuccess(data);
        } catch (err: any) {
            // Provide more specific error messages
            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (err.message?.toLowerCase().includes('credential')) {
                errorMessage = 'Incorrect email or password. Please check your credentials and try again.';
            } else if (err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('too many')) {
                errorMessage = '⚠️ Too many login attempts. Please wait a few minutes and try again.';
            } else if (err.message?.toLowerCase().includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (err.message?.toLowerCase().includes('account')) {
                errorMessage = err.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleTotpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!totpCode || !loginResponse) return;

        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const verifyData: TotpVerifyRequest = {
                token: totpCode,
                userType: (loginResponse.user?.hasGlobalAccount ?? (loginResponse.userType === 'global')) ? 'global' : 'org',
                tenantSlug: selectedOrg || loginResponse.user?.activeMembership?.tenantSlug || undefined,
            };

            const data: UniversalLoginResponse = await apiPost('/auth/universal-totp-verify', verifyData);

            // Show success message
            setSuccessMessage("2FA verified! Redirecting...");

            await handleLoginSuccess(data);
        } catch (err: any) {
            // Provide specific TOTP error messages
            let errorMessage = 'Invalid authentication code.';

            if (err.message?.toLowerCase().includes('expired')) {
                errorMessage = 'The code has expired. Please try with a new code from your authenticator app.';
            } else if (err.message?.toLowerCase().includes('invalid')) {
                errorMessage = 'Invalid code. Please check your authenticator app and try again.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = async (data: UniversalLoginResponse) => {
        try {
            console.log('[Login] Login successful, refreshing auth context...');

            // Refresh auth context to load the global user session
            await refresh();

            console.log('[Login] Auth context refreshed');

            // Add small delay to ensure the auth context has fully updated
            // This prevents race condition where AdminGuard checks before context is ready
            await new Promise(resolve => setTimeout(resolve, 200));

            // Check if there's a redirect URL in search params
            const redirectTo = searchParams?.get('redirect');

            console.log('[Login] Redirect URL:', redirectTo);

            if (redirectTo && redirectTo.startsWith('/')) {
                console.log('[Login] Redirecting to:', redirectTo);
                router.push(redirectTo);
                return;
            }

            const memberships = extractMemberships(data);
            const validMemberships = memberships.filter((membership) => membership.tenantSlug);
            const globalOrganisations = data.user?.globalOrganisations ?? data.globalUser?.organizations ?? [];
            const hasGlobalAccount = data.user?.hasGlobalAccount ?? Boolean(data.globalUser);
            const isGlobalAdmin = data.user?.isGlobalAdmin ?? Boolean(data.globalUser?.isGlobalAdmin);

            // Route based on user type
            // Priority: onboarding > Global Admin > Org User > Global User
            if (hasGlobalAccount && globalOrganisations.length === 0) {
                router.push('/admin/get-started');
            } else if (isGlobalAdmin) {
                // Global admins always go to admin control center
                router.push('/admin/control-center');
            } else if (validMemberships.length > 0) {
                // Organization user - go to their org dashboard
                if (validMemberships.length === 1) {
                    router.push(`/org/${validMemberships[0].tenantSlug}/dashboard`);
                } else if (validMemberships.length > 1) {
                    router.push('/org/select');
                } else {
                    // No valid org accounts, fallback to admin overview
                    router.push('/admin/overview');
                }
            } else if (hasGlobalAccount && globalOrganisations.length > 0) {
                // Global user (non-admin) - check if they have organizations
                if (globalOrganisations.length === 1) {
                    router.push(`/org/${globalOrganisations[0].slug}/overview`);
                } else {
                    router.push('/org/select');
                }
            } else {
                // Fallback
                router.push('/admin/overview');
            }
        } catch (err) {
            setError('Login successful, but failed to redirect. Please refresh the page.');
            setIsLoading(false);
        }
    };

    const handleOrgSelect = async (orgSlug: string) => {
        setSelectedOrg(orgSlug);
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            // Login to specific org
            const data: any = await apiPost(`/org/${orgSlug}/auth/login`, {
                email,
                password
            });

            // Check if TOTP required for this org
            if (data.requiresTotp) {
                setSuccessMessage("Organization selected! Please enter your 2FA code.");
                setRequiresTotp(true);
                setIsLoading(false);
                return;
            }

            // Show success and redirect
            setSuccessMessage("Access granted! Redirecting...");
            setTimeout(() => {
                router.push(`/org/${orgSlug}/dashboard`);
            }, 500);
        } catch (err: any) {
            setError(err.message || 'Failed to access organization. Please try again.');
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Remove manual Enter handling - let the form's onSubmit handle it
        // This prevents double submission
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>
                <div className="relative z-10 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-2xl blur-lg opacity-75"></div>
                            <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                                <img
                                    src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                                    alt="ReplayHub Logo"
                                    className="h-12 w-12 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white text-lg font-medium">Checking your session...</p>
                </div>
            </div>
        );
    }

    // Show organization selection if user has multiple org accounts
    if (shouldShowOrgSelection) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
                {/* Animated gradient background - full page */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>

                <div className="absolute top-20 left-20 w-96 h-96 bg-[#2ef6fc] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-[#fc040e] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative max-w-md w-full mx-4 space-y-8 animate-fade-in z-10">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                                    <img
                                        src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                                        alt="ReplayHub Logo"
                                        className="h-12 w-12 object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold font-montserrat text-white drop-shadow-lg">
                            ReplayHub
                        </h1>
                    </div>

                    <Card className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-white/30 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="font-montserrat font-bold text-2xl">Select Organization</CardTitle>
                            <CardDescription className="font-montserrat">
                                Choose which organization you'd like to access
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {membershipOptions.map((org) => (
                                    <button
                                        key={org.orgUserId}
                                        onClick={() => handleOrgSelect(org.tenantSlug)}
                                        disabled={isLoading}
                                        className="w-full p-4 text-left border-2 rounded-xl hover:bg-white/50 hover:border-[#2ef6fc] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold font-montserrat group-hover:text-[#2ef6fc] transition-colors">
                                                    {org.tenantName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">@{org.tenantSlug}</div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#2ef6fc] group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 animate-shake">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {successMessage && (
                                <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                            {successMessage}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <AppButton
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setLoginResponse(null);
                                    setSelectedOrg(null);
                                    setError("");
                                }}
                                className="w-full mt-6"
                            >
                                ← Back to Login
                            </AppButton>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Show TOTP verification
    if (requiresTotp) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
                {/* Animated gradient background - full page */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>

                <div className="absolute top-20 left-20 w-96 h-96 bg-[#2ef6fc] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-[#fc040e] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative max-w-md w-full mx-4 space-y-8 animate-fade-in z-10">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                                    <img
                                        src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                                        alt="ReplayHub Logo"
                                        className="h-12 w-12 object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold font-montserrat text-white drop-shadow-lg">
                            ReplayHub
                        </h1>
                    </div>

                    <Card className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-white/30 shadow-2xl">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] bg-opacity-10">
                                    <Lock className="h-8 w-8 text-[#2ef6fc]" />
                                </div>
                            </div>
                            <CardTitle className="font-montserrat font-bold text-2xl text-center">
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription className="font-montserrat text-center">
                                Enter the 6-digit code from your authenticator app
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleTotpVerify} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="totp" className="font-montserrat font-medium text-sm">
                                        Authentication Code
                                    </Label>
                                    <Input
                                        id="totp"
                                        name="totp"
                                        type="text"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        value={totpCode}
                                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        required
                                        autoComplete="one-time-code"
                                        autoFocus
                                        className="h-14 text-center text-2xl font-mono tracking-widest transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Open your authenticator app to get the code
                                    </p>
                                </div>

                                {successMessage && (
                                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 animate-fade-in">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                                {successMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 animate-shake">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <AppButton
                                    type="submit"
                                    isLoading={isLoading}
                                    disabled={!totpCode || totpCode.length !== 6 || isLoading}
                                    className="w-full h-11 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : (
                                        "Verify & Continue"
                                    )}
                                </AppButton>

                                <AppButton
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setRequiresTotp(false);
                                        setTotpCode("");
                                        setError("");
                                        setLoginResponse(null);
                                    }}
                                    className="w-full"
                                >
                                    ← Back to Login
                                </AppButton>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                            <Lock className="h-3.5 w-3.5 text-white" />
                            <span className="text-xs font-medium text-white">
                                Extra layer of security
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main login form
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden">
            {/* Animated gradient background - full page */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            </div>

            {/* Floating orbs for visual interest */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-[#2ef6fc] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-[#fc040e] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-40 w-96 h-96 bg-[#2ef6fc] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* Left side - Branding - Hidden on mobile, shown on lg+ */}
            <div className="hidden lg:flex relative flex-1 items-center justify-center p-8 xl:p-16 z-10">
                <div className="max-w-xl space-y-8 xl:space-y-10 animate-fade-in">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 xl:gap-5">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white rounded-2xl blur-2xl opacity-60"></div>
                                <div className="relative bg-white p-4 xl:p-5 rounded-2xl shadow-2xl">
                                    <img
                                        src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                                        alt="ReplayHub Logo"
                                        className="h-16 w-16 xl:h-20 xl:w-20 object-contain"
                                    />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl xl:text-7xl font-bold font-montserrat text-white drop-shadow-2xl">
                                    ReplayHub
                                </h1>
                                <p className="text-xl xl:text-2xl text-white/95 font-montserrat mt-2 drop-shadow-lg">
                                    Esports Operations Platform
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 xl:space-y-5 text-white drop-shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-3 h-3 rounded-full bg-white mt-2 flex-shrink-0"></div>
                            <p className="text-lg xl:text-xl font-medium">Unified platform for all esports operations</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-3 h-3 rounded-full bg-white mt-2 flex-shrink-0"></div>
                            <p className="text-xl font-medium">Secure, scalable, and built for esports</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="relative w-full lg:max-w-[550px] bg-white dark:bg-gray-900 shadow-lg lg:shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex items-center justify-center p-6 sm:p-8 lg:p-16 z-20 min-h-screen">
                <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
                    {/* Mobile logo - shown only on small screens */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-2xl blur-lg opacity-75"></div>
                            <div className="relative bg-white p-3 rounded-2xl shadow-2xl">
                                <img
                                    src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                                    alt="ReplayHub Logo"
                                    className="h-12 w-12 object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                        <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-center">
                            Welcome Back
                        </h2>
                        <p className="text-center text-sm sm:text-base text-muted-foreground font-montserrat">
                            Sign in to access your account
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5"
                        role="form"
                        aria-label="Login form"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-montserrat font-medium text-sm">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                autoFocus
                                aria-label="Email address"
                                aria-required="true"
                                aria-invalid={error ? "true" : "false"}
                                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-montserrat font-medium text-sm">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    aria-label="Password"
                                    aria-required="true"
                                    aria-invalid={error ? "true" : "false"}
                                    className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    aria-label="Remember me for future logins"
                                    className="h-4 w-4 rounded border-gray-300 text-[#2ef6fc] focus:ring-2 focus:ring-[#2ef6fc] transition-colors cursor-pointer"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                >
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-[#2ef6fc] hover:text-[#fc040e] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {successMessage && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 animate-fade-in"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" aria-hidden="true" />
                                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                        {successMessage}
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div
                                role="alert"
                                aria-live="assertive"
                                className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 animate-shake"
                            >
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        <AppButton
                            type="submit"
                            isLoading={isLoading}
                            disabled={!email || !password || isLoading}
                            className="w-full h-11 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </AppButton>
                    </form>

                    {/* Security badge */}
                    <div className="text-center mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Lock className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Secured with industry-standard encryption
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UniversalLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                        <CardHeader className="text-center pb-6 space-y-3">
                            <div className="mx-auto w-fit">Loading...</div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        }>
            <UniversalLoginContent />
        </Suspense>
    );
}
