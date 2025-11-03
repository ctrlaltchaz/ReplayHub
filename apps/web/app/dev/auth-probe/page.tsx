"use client";

import { AppButton } from "@/components/ui/AppButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthProbePage() {
    const router = useRouter();
    const {
        globalUser,
        orgUser,
        permissions,
        loginGlobal,
        logoutGlobal,
        isLoadingGlobal,
        isLoadingOrg
    } = useAuth();

    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password");
    const [orgSlug, setOrgSlug] = useState("example-org");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;

        setLoading(true);
        setError("");

        try {
            await loginGlobal({ email, password });
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setError("");

        try {
            await logoutGlobal();
        } catch (err: any) {
            setError(err?.message || "Logout failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Auth Probe</h1>
            <p className="text-gray-600 mb-8">
                Development tool for testing authentication flows
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Global User Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Global Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoadingGlobal ? (
                            <p className="text-gray-500">Loading user...</p>
                        ) : globalUser ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="default" className="bg-green-500">✓ Authenticated</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p><strong>ID:</strong> {globalUser.id}</p>
                                    <p><strong>Email:</strong> {globalUser.email}</p>
                                    <p><strong>Name:</strong> {globalUser.name || 'N/A'}</p>
                                </div>
                                <AppButton
                                    onClick={handleLogout}
                                    disabled={loading}
                                    variant="destructive"
                                    size="sm"
                                >
                                    {loading ? "Logging out..." : "Logout"}
                                </AppButton>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Badge variant="destructive">✗ Not authenticated</Badge>

                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter email"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter password"
                                        />
                                    </div>

                                    <AppButton
                                        onClick={handleLogin}
                                        disabled={loading || !email || !password}
                                        isLoading={loading}
                                        className="w-full"
                                    >
                                        Login Globally
                                    </AppButton>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Org User Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Organization Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="orgSlug">Organization Slug</Label>
                            <Input
                                id="orgSlug"
                                value={orgSlug}
                                onChange={(e) => setOrgSlug(e.target.value)}
                                placeholder="org-slug"
                            />
                        </div>

                        {isLoadingOrg ? (
                            <p className="text-gray-500">Loading org user...</p>
                        ) : orgUser ? (
                            <div className="space-y-4">
                                <Badge variant="default" className="bg-green-500">✓ Org Authenticated</Badge>
                                <div className="space-y-2">
                                    <p><strong>ID:</strong> {orgUser.id}</p>
                                    <p><strong>Roles:</strong> {orgUser.roles?.join(', ') || 'N/A'}</p>
                                </div>
                                {permissions.length > 0 && (
                                    <div>
                                        <p><strong>Permissions:</strong></p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {permissions.slice(0, 5).map((perm: string) => (
                                                <Badge key={perm} variant="outline" className="text-xs">
                                                    {perm}
                                                </Badge>
                                            ))}
                                            {permissions.length > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{permissions.length - 5} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Badge variant="destructive">✗ No org session</Badge>
                        )}
                    </CardContent>
                </Card>

                {/* Login Page Navigation */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Login Page Navigation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <AppButton
                                onClick={() => router.push('/login')}
                                variant="outline"
                            >
                                Global Login Page
                            </AppButton>
                            <AppButton
                                onClick={() => router.push(`/org/${orgSlug}/login`)}
                                variant="outline"
                                disabled={!orgSlug}
                            >
                                Org Login Page
                            </AppButton>
                            <AppButton
                                onClick={() => router.push('/org/select')}
                                variant="outline"
                            >
                                Org Select Page
                            </AppButton>
                        </div>

                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <AppButton
                                onClick={() => router.push(`/org/${orgSlug}/overview`)}
                                disabled={!orgSlug}
                            >
                                Test Protected Route
                            </AppButton>
                            <AppButton
                                onClick={() => router.push('/')}
                                variant="ghost"
                            >
                                Home Page
                            </AppButton>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Card className="mt-6 border-red-200">
                    <CardContent className="pt-6">
                        <div className="text-sm text-red-600" role="alert">
                            <strong>Error:</strong> {error}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}