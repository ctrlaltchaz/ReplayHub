import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../api/client';

export interface SocialLinks {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    branding?: any;
    createdAt: string;
}

export interface OrganizationAdmin {
    id: string;
    role: string;
    createdAt: string;
    organisation: Organization;
}

export interface OrgUserRole {
    id: string;
    role: {
        id: string;
        name: string;
    };
}

export interface OrgUser {
    id: string;
    tenantId: string;
    displayName: string;
    email: string;
    roles: OrgUserRole[];
    organisation?: Organization; // Now included from backend
}

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    bio?: string | null;
    location?: string | null;
    timezone?: string | null;
    socialLinks?: SocialLinks | null;
    createdAt: string;
    lastLoginAt?: string | null;
    organisations?: Organization[];
    organisationAdmins?: OrganizationAdmin[];
    orgUsers?: OrgUser[];
}

export interface UpdateProfileData {
    bio?: string;
    location?: string;
    timezone?: string;
    socialLinks?: SocialLinks;
}

export function useUserProfile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGet<{ user: UserProfile }>('/global/users/profile');
            setProfile(response.user);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { profile, loading, error, refetch: fetchProfile };
}

export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (data: UpdateProfileData): Promise<UserProfile | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiPut<{ user: UserProfile }>('/global/users/profile', data);
            return response.user;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update profile';
            setError(errorMessage);
            console.error('Error updating profile:', err);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return { updateProfile, loading, error };
}
