import { useState } from 'react';

interface ToastOptions {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export function useToast() {
    const [, setToasts] = useState<ToastOptions[]>([]);

    const toast = (options: ToastOptions) => {
        // Simple implementation using alert for now
        // In production, you'd use a proper toast library like sonner or react-hot-toast
        const message = [options.title, options.description].filter(Boolean).join(': ');
        if (options.variant === 'destructive') {
            console.error('[Toast Error]', message);
            alert(`Error: ${message}`);
        } else {
            console.log('[Toast]', message);
            // For success messages, we'll skip alert unless you want them
        }
        setToasts((prev) => [...prev, options]);
    };

    return { toast };
}
