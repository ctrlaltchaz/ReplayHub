"use client";

import { QuickLoginSetup } from "@/components/quick-login-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function QuickLoginPage() {
  usePageTitle("Quick Login PIN");

  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const { globalUser, refresh } = useAuth();

  const handleUpdate = async () => {
    await refresh();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/org/${slug}/profile`)}
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] shadow-lg">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Quick Login PIN</h1>
            <p className="text-muted-foreground">Set up a PIN for faster login on this device</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Create Your PIN</p>
                    <p className="text-xs text-muted-foreground">
                      Choose a 4-6 digit PIN for this device
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Quick Access</p>
                    <p className="text-xs text-muted-foreground">
                      Login with just your PIN instead of password
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Device Specific</p>
                    <p className="text-xs text-muted-foreground">
                      Your PIN only works on this device for security
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>You can always use your password to login from any device</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Setup Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>PIN Configuration</CardTitle>
              <CardDescription>Manage your quick login settings below</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickLoginSetup
                isEnabled={globalUser?.quickLoginEnabled ?? false}
                onUpdate={handleUpdate}
                userEmail={globalUser?.email ?? ""}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
