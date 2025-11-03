"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api/client";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await apiPost('/auth/request-password-reset', { email });

            setSuccess(true);
            setIsLoading(false);
        } catch (err: any) {
            let errorMessage = 'Failed to send reset link. Please try again.';

            if (err.message?.toLowerCase().includes('rate limit') || err.message?.toLowerCase().includes('too many')) {
                errorMessage = '⚠️ Too many reset requests. Please wait a few minutes before trying again.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    };

    // Show success screen
    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
                {/* Animated gradient background */}
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
                                    <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-montserrat">Check Your Email</h2>
                                <p className="text-muted-foreground">
                                    If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
                                </p>
                            </div>

                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    The link will expire in 1 hour. If you don't receive an email, check your spam folder.
                                </p>
                            </div>

                            <Link href="/login">
                                <AppButton variant="outline" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </AppButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Request form
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            {/* Animated gradient background */}
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
                            <h2 className="text-2xl font-bold font-montserrat">Reset Password</h2>
                            <p className="text-muted-foreground">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" role="form" aria-label="Password reset request form">
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
                                    aria-label="Email address for password reset"
                                    aria-required="true"
                                    aria-describedby={error ? "email-error" : undefined}
                                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {error && (
                                <div
                                    id="email-error"
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
                                disabled={!email || isLoading}
                                className="w-full h-11 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending Reset Link...
                                    </span>
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Send Reset Link
                                    </>
                                )}
                            </AppButton>
                        </form>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Link href="/login">
                                <AppButton variant="ghost" className="w-full">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
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
