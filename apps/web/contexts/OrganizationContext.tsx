'use client';

import { getApiUrl } from '@/lib/api/config';
import { applyTheme } from '@/lib/theme/applyTheme';
import type { Organization, OrganizationBranding } from '@/lib/types/organization';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface OrganizationContextType {
    organization: Organization | null;
    branding: OrganizationBranding | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
    children: React.ReactNode;
    orgSlug: string;
}

export function OrganizationProvider({ children, orgSlug }: OrganizationProviderProps) {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganization = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(getApiUrl(`/org/${orgSlug}/profile`), {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch organization');
            }

            const data = await response.json();
            setOrganization(data.organization);
        } catch (err: any) {
            console.error('Failed to fetch organization:', err);
            setError(err.message || 'Failed to load organization');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (orgSlug) {
            fetchOrganization();
        }
    }, [orgSlug]);

    // Apply theme when branding changes
    useEffect(() => {
        if (organization?.branding) {
            applyTheme(organization.branding);
        }
        // Don't cleanup theme on unmount to prevent flickering
    }, [organization?.branding]);

    const branding = organization?.branding || null;

    const value: OrganizationContextType = {
        organization,
        branding,
        isLoading,
        error,
        refetch: fetchOrganization,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (context === undefined) {
        throw new Error('useOrganization must be used within an OrganizationProvider');
    }
    return context;
}
