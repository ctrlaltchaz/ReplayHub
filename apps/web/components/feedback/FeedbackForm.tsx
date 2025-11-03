'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Bug, Lightbulb, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface FeedbackFormProps {
    onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const params = useParams();
    const slug = params?.slug as string | undefined;

    const [type, setType] = useState<'BUG' | 'SUGGESTION'>('BUG');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            toast({
                title: 'Missing information',
                description: 'Please provide both a title and description',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Collect browser metadata
            const metadata: any = {
                browser: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                url: window.location.href,
            };

            // Add org context if in org
            if (slug) {
                metadata.organizationSlug = slug;
            }

            const response = await fetch('/api/feedback/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    type,
                    title: title.trim(),
                    description: description.trim(),
                    category: category.trim() || undefined,
                    metadata,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit feedback');
            }

            toast({
                title: 'Feedback submitted!',
                description: 'Thank you for your feedback. We\'ll review it soon.',
            });

            // Reset form
            setTitle('');
            setDescription('');
            setCategory('');

            // Invalidate my submissions query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['my-feedback-submissions'] });

            // Call success callback
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast({
                title: 'Submission failed',
                description: 'Failed to submit feedback. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Feedback</CardTitle>
                <CardDescription>
                    Report bugs or suggest improvements to help us make the platform better
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(value: 'BUG' | 'SUGGESTION') => setType(value)}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BUG">
                                    <div className="flex items-center gap-2">
                                        <Bug className="h-4 w-4 text-red-500" />
                                        <span>Bug Report</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="SUGGESTION">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                                        <span>Feature Suggestion</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Brief summary of the issue or suggestion"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category (Optional)</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UI">User Interface</SelectItem>
                                <SelectItem value="Performance">Performance</SelectItem>
                                <SelectItem value="Features">Features</SelectItem>
                                <SelectItem value="Data">Data / Reports</SelectItem>
                                <SelectItem value="Integration">Integrations</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder={
                                type === 'BUG'
                                    ? 'Describe what happened, what you expected, and steps to reproduce...'
                                    : 'Describe your feature suggestion and how it would help...'
                            }
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={8}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Be as detailed as possible. Include steps to reproduce for bugs.
                        </p>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Feedback'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
