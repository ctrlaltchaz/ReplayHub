'use client';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MySubmissions } from '@/components/feedback/MySubmissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Bug, Lightbulb, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function FeedbackPage() {
    const { globalUser } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('submit');

    if (!globalUser) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <MessageSquare className="h-8 w-8" />
                        Feedback & Bug Reports
                    </h1>
                    <p className="text-muted-foreground">
                        Help us improve the platform by reporting bugs or suggesting new features
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Bug className="h-5 w-5 text-red-500" />
                            <CardTitle>Report a Bug</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            Found something not working as expected? Let us know so we can fix it.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            <CardTitle>Suggest a Feature</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            Have an idea to make the platform better? We'd love to hear it!
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
                    <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="submit" className="space-y-6">
                    <FeedbackForm onSuccess={() => setActiveTab('my-submissions')} />
                </TabsContent>

                <TabsContent value="my-submissions" className="space-y-6">
                    <MySubmissions />
                </TabsContent>
            </Tabs>
        </div>
    );
}
