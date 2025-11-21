import { getApiUrl } from "./config";
import { ApiError } from "./errors";

export interface FetchOptions {
  slug?: string;
  timeoutMs?: number;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  credentials?: "include" | "omit" | "same-origin";
  cache?: "default" | "no-cache" | "reload" | "force-cache" | "only-if-cached";
}

export async function fetchJson<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const { slug, timeoutMs = 30000, ...fetchOptions } = init;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add org slug header if provided
  if (slug) {
    headers["x-org-slug"] = slug;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = getApiUrl(path);
    const res = await fetch(url, {
      ...fetchOptions,
      credentials: "include", // Always include credentials for session auth
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }

      // Log error details to console for debugging
      console.error("[API] Request failed:", {
        url,
        status: res.status,
        statusText: res.statusText,
        errorData,
        requestBody: fetchOptions.body,
      });

      // Handle 401 Unauthorized - redirect to login with return URL
      if (res.status === 401) {
        const lowerPath = path.toLowerCase();
        const errorMsg = (errorData?.message || "").toLowerCase();

        // Avoid automatic redirects for org-scoped auth/me checks and other org endpoints,
        // which can legitimately 401 for limited roles and would otherwise cause loops.
        const isOrgEndpoint = lowerPath.startsWith("/org/");
        const isSessionCheck =
          lowerPath.includes("/auth/session") || lowerPath.endsWith("/auth/me");

        // If truly unauthenticated (no session), redirect regardless of endpoint.
        const isUnauthenticated =
          errorMsg.includes("not authenticated") ||
          errorMsg.includes("unauthorized") ||
          errorMsg.includes("no active session");

        const shouldRedirect =
          (isUnauthenticated || !isOrgEndpoint) &&
          !isSessionCheck &&
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/invite/") &&
          !window.location.pathname.startsWith("/forgot-password") &&
          !window.location.pathname.startsWith("/reset-password/");

        if (shouldRedirect) {
          const currentPath = window.location.pathname + window.location.search;
          const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
          window.location.href = loginUrl;
        }
      }

      throw new ApiError(
        res.status,
        errorData?.message || `HTTP ${res.status}: ${res.statusText}`,
        errorData?.code
      );
    }

    // Handle 204 No Content responses (e.g., DELETE requests)
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    // Check if response has JSON content
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    // For non-JSON responses, return undefined
    return undefined as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, "Request timeout");
    }

    throw new ApiError(0, error instanceof Error ? error.message : "Network error");
  }
}
