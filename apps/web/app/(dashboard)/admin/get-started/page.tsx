'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { apiPost } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function AdminGetStartedPage() {
    const router = useRouter();
    const { globalUser } = useAuth();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const suggestedSlug = useMemo(() => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40);
    }, [name]);

    useEffect(() => {
        if (!slug && suggestedSlug) {
            setSlug(suggestedSlug);
        }
    }, [slug, suggestedSlug]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiPost<{ organisation: { slug: string } }>('/global/orgs', {
                name,
                slug,
            });

            router.push(`/org/${response.organisation.slug}/dashboard`);
        } catch (err: any) {
            setError(err?.message || 'Failed to create organisation.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-16">
            <Card>
                <CardHeader>
                    <CardTitle>Set Up Your First Organisation</CardTitle>
                    <CardDescription>
                        Welcome{globalUser?.name ? `, ${globalUser.name}` : ''}! Create an organisation to unlock dashboards, rosters, events, and more.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organisation Name</Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="ReplayHub Esports"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="org-slug">Slug</Label>
                            <Input
                                id="org-slug"
                                value={slug}
                                onChange={(event) => setSlug(event.target.value.toLowerCase())}
                                pattern="[a-z0-9-]{2,40}"
                                placeholder="replayhub"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs: https://app.replayhub.app/org/<span className="font-mono">{slug || 'your-slug'}</span>
                            </p>
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4">
                            <Button type="submit" disabled={isSubmitting || !name || !slug}>
                                {isSubmitting ? 'Creating…' : 'Create Organisation'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/admin/overview')}
                            >
                                Skip for now
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
