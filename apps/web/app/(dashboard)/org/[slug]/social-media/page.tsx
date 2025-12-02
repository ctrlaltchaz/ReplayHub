"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import { ArrowLeft, Share2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function SocialMediaPage() {
  usePageTitle("Social Media");

  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Social Media
          </h1>
          <p className="text-muted-foreground">Manage and schedule your social media content</p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary/10 rounded-full">
                <Share2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-montserrat mb-2">Features Coming Soon</CardTitle>
            <CardDescription className="text-lg">
              We're working on bringing you powerful social media management tools
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8 space-y-4">
            <p className="text-muted-foreground">
              Stay tuned for updates. We'll notify you when these features become available!
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/org/${slug}/overview`)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
