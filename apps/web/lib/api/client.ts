import { fetchJson, type FetchOptions } from "./http";

export type ApiOptions = Omit<FetchOptions, 'method' | 'body'>;

export async function apiGet<T>(path: string, options?: ApiOptions): Promise<T> {
    return fetchJson<T>(path, { ...options, method: 'GET' });
}

export async function apiPost<T>(
    path: string,
    data?: unknown,
    options?: ApiOptions
): Promise<T> {
    return fetchJson<T>(path, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

export async function apiPut<T>(
    path: string,
    data?: unknown,
    options?: ApiOptions
): Promise<T> {
    return fetchJson<T>(path, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

export async function apiPatch<T>(
    path: string,
    data?: unknown,
    options?: ApiOptions
): Promise<T> {
    return fetchJson<T>(path, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
    });
}

export async function apiDelete<T>(path: string, options?: ApiOptions): Promise<T> {
    return fetchJson<T>(path, { ...options, method: 'DELETE' });
}