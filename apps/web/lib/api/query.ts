import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, type ApiOptions } from './client';
import { ApiError } from './errors';

export interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T, ApiError>, 'queryFn' | 'queryKey'> {
    apiOptions?: ApiOptions;
}

export interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    apiOptions?: ApiOptions;
}

export function useApiQuery<T>(
    path: string,
    options?: UseApiQueryOptions<T>
) {
    const { apiOptions, ...queryOptions } = options || {};

    return useQuery<T, ApiError>({
        queryKey: [path, apiOptions?.slug],
        queryFn: () => apiGet<T>(path, apiOptions),
        ...queryOptions,
    });
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
    path: string,
    options?: UseApiMutationOptions<TData, TVariables>
) {
    const { method = 'POST', apiOptions, ...mutationOptions } = options || {};

    return useMutation<TData, ApiError, TVariables>({
        ...mutationOptions,
        mutationFn: async (variables: TVariables) => {
            switch (method) {
                case 'POST':
                    return apiPost<TData>(path, variables, apiOptions);
                case 'PUT':
                    return apiPut<TData>(path, variables, apiOptions);
                case 'PATCH':
                    return apiPatch<TData>(path, variables, apiOptions);
                case 'DELETE':
                    return apiDelete<TData>(path, apiOptions);
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        },
    });
}