export class ApiError extends Error {
    public readonly status: number;
    public readonly code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }

    get isAuthError(): boolean {
        return this.status === 401;
    }

    get isForbiddenError(): boolean {
        return this.status === 403;
    }

    get isNotFoundError(): boolean {
        return this.status === 404;
    }

    get isValidationError(): boolean {
        return this.status === 400;
    }
}

export const isApiError = (e: any): e is ApiError => e instanceof ApiError;