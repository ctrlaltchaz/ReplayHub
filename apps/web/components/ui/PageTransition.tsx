'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 400);
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <div
            className={`${isAnimating ? 'animate-slide-in-up' : ''
                } transition-opacity duration-300`}
        >
            {children}
        </div>
    );
}
