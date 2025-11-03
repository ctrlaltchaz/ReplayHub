'use client';

import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function DiscordCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [hasHandled, setHasHandled] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (!searchParams || hasHandled) return;

            const success = searchParams.get('success');
            const error = searchParams.get('error');

            // Try to get where user came from (stored before OAuth redirect)
            const returnPath = sessionStorage.getItem('discord_return_path') || '/profile';
            sessionStorage.removeItem('discord_return_path');

            if (error) {
                setHasHandled(true);
                setStatus('error');
                toast({
                    variant: 'destructive',
                    title: 'Discord Linking Failed',
                    description: 'Failed to link Discord account. Please try again.',
                });
                setTimeout(() => router.push(returnPath), 2000);
                return;
            }

            if (success === 'true') {
                setHasHandled(true);
                setStatus('success');
                toast({
                    title: 'Success!',
                    description: 'Discord account linked successfully',
                });
                setTimeout(() => router.push(returnPath), 1500);
                return;
            }

            // If we get here, something unexpected happened
            setHasHandled(true);
            setStatus('error');
            toast({
                variant: 'destructive',
                title: 'Discord Linking Failed',
                description: 'Unexpected error occurred.',
            });
            setTimeout(() => router.push(returnPath), 2000);
        };

        handleCallback();
    }, [searchParams, router, toast, hasHandled]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <h2 className="text-2xl font-bold">Linking Discord Account...</h2>
                        <p className="text-muted-foreground">Please wait while we connect your account</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold">Success!</h2>
                        <p className="text-muted-foreground">Redirecting to your profile...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center mx-auto">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold">Failed to Link</h2>
                        <p className="text-muted-foreground">Redirecting back to profile...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function DiscordCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <h2 className="text-2xl font-bold">Loading...</h2>
                </div>
            </div>
        }>
            <DiscordCallbackContent />
        </Suspense>
    );
}
