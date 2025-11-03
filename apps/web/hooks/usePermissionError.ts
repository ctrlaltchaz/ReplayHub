import { ApiError, isApiError } from '@/lib/api/errors';
import { useRouter } from 'next/navigation';

export interface UsePermissionErrorOptions {
    onPermissionDenied?: (error: ApiError) => void;
    redirectTo?: string;
    showToast?: boolean;
}

/**
 * Hook to handle 403 permission errors from API calls
 */
export function usePermissionError(options: UsePermissionErrorOptions = {}) {
    const router = useRouter();

    const handlePermissionError = (error: any) => {
        if (isApiError(error) && error.isForbiddenError) {
            if (options.onPermissionDenied) {
                options.onPermissionDenied(error);
            }

            if (options.showToast !== false) {
                // TODO: Add toast notification when toast system is available
                console.warn('Permission denied:', error.message || 'You do not have permission to perform this action');
            }

            if (options.redirectTo) {
                router.push(options.redirectTo);
            }

            return true; // Indicates error was handled
        }

        return false; // Error was not a permission error
    };

    return { handlePermissionError };
}