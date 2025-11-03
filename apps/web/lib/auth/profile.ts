import { getApiUrl } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';
import { useApiMutation, type UseApiMutationOptions } from '@/lib/api/query';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { GlobalUser } from './session';

// Profile update types
export interface UpdateProfileDto {
    name?: string;
    email?: string;
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface AvatarUploadResponse {
    url: string;
}

// Profile mutation hooks
export function useUpdateProfile(options?: UseApiMutationOptions<GlobalUser, UpdateProfileDto>) {
    return useApiMutation<GlobalUser, UpdateProfileDto>('/global/auth/profile', {
        method: 'PATCH',
        ...options,
    });
}

export function useChangePassword(options?: UseApiMutationOptions<void, ChangePasswordDto>) {
    return useApiMutation<void, ChangePasswordDto>('/global/auth/change-password', {
        method: 'POST',
        ...options,
    });
}

// Avatar upload with FormData
export function useUploadAvatar(options?: Omit<UseMutationOptions<AvatarUploadResponse, ApiError, FormData>, 'mutationFn'>) {
    return useMutation<AvatarUploadResponse, ApiError, FormData>({
        ...options,
        mutationFn: async (formData: FormData) => {
            const response = await fetch(getApiUrl('/global/auth/avatar'), {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new ApiError(response.status, error.message || 'Upload failed');
            }

            return response.json();
        },
    });
}
