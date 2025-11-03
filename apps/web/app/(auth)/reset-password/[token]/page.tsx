"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/ui/PasswordStrengthIndicator";
import { apiPost } from "@/lib/api/client";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = (params?.token as string) || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState("");

    // Verify token on mount
    useEffect(() => {
        if (token) {
            verifyToken();
        }
    }, [token]);

    const verifyToken = async () => {
        try {
            const data: any = await apiPost('/auth/verify-reset-token', { token });
            setTokenValid(true);
            setEmail(data.email || "");
            setIsVerifying(false);
        } catch (err: any) {
            setError(err.message || 'Invalid or expired reset token');
            setTokenValid(false);
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await apiPost('/auth/reset-password', {
                token,
                newPassword
            });

            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please try again.');
            setIsLoading(false);
        }
    };

    // Loading state
    if (isVerifying) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                </div>

                <div className="relative text-center space-y-4 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
                    <p className="text-white font-medium">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid token
    if (!tokenValid) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
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

                    <div className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-white/30 shadow-2xl rounded-2xl p-8">
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-montserrat">Invalid Reset Link</h2>
                                <p className="text-muted-foreground">
                                    {error}
                                </p>
                            </div>

                            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-4">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Reset links expire after 1 hour and can only be used once. Please request a new reset link.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Link href="/forgot-password">
                                    <AppButton className="w-full bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white">
                                        Request New Link
                                    </AppButton>
                                </Link>
                                <Link href="/login">
                                    <AppButton variant="outline" className="w-full">
                                        Back to Login
                                    </AppButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
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

                    <div className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-white/30 shadow-2xl rounded-2xl p-8">
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-montserrat">Password Reset!</h2>
                                <p className="text-muted-foreground">
                                    Your password has been successfully reset. You can now log in with your new password.
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Redirecting to login page in 3 seconds...
                                </p>
                            </div>

                            <Link href="/login">
                                <AppButton className="w-full bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white">
                                    Go to Login
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </AppButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
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

                <div className="backdrop-blur-md bg-white/95 dark:bg-gray-900/95 border-white/30 shadow-2xl rounded-2xl p-8">
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] bg-opacity-10">
                                    <Lock className="h-8 w-8 text-[#2ef6fc]" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold font-montserrat">Set New Password</h2>
                            <p className="text-muted-foreground text-sm">
                                Creating new password for <strong>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" role="form" aria-label="Reset password form">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="font-montserrat font-medium text-sm">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        autoFocus
                                        aria-label="New password"
                                        aria-required="true"
                                        aria-describedby="password-strength"
                                        className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                                    </button>
                                </div>
                                <div id="password-strength">
                                    <PasswordStrengthIndicator password={newPassword} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-montserrat font-medium text-sm">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        autoComplete="new-password"
                                        aria-label="Confirm new password"
                                        aria-required="true"
                                        className="h-11 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>

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
                                disabled={!newPassword || !confirmPassword || isLoading}
                                className="w-full h-11 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Resetting Password...
                                    </span>
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </AppButton>
                        </form>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Link href="/login">
                                <AppButton variant="ghost" className="w-full">
                                    Back to Login
                                </AppButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
