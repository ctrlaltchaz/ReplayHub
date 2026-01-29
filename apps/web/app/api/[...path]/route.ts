import { NextRequest, NextResponse } from "next/server";

/**
 * Catch-all API proxy route for local development
 * This proxies requests from /api/* to the NestJS backend at localhost:3001/api/*
 * while properly forwarding cookies and headers
 *
 * In production, NEXT_PUBLIC_API_URL should point directly to the API
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "GET");
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "POST");
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "PUT");
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "PATCH");
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path, "DELETE");
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  const path = pathSegments.join("/");
  const backendUrl = `http://localhost:3001/api/${path}`;

  // Get query params
  const url = new URL(request.url);
  const queryString = url.search;
  const fullUrl = `${backendUrl}${queryString}`;

  console.log(`[API Proxy] ${method} ${fullUrl}`);

  // Forward headers, including cookies
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Don't forward host and connection headers
    if (!["host", "connection"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Explicitly forward cookies from the browser request
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
    console.log(`[API Proxy] Forwarding cookies: ${cookieHeader}`);
  }

  // Get request body for POST/PUT/PATCH
  let body: BodyInit | undefined;
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      // Check if this is a multipart/form-data request (file upload)
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("multipart/form-data")) {
        // For multipart requests, pass the body as-is (FormData)
        body = await request.blob();
      } else {
        // For other requests, read as text
        body = await request.text();
      }
    } catch (e) {
      // No body or already consumed
    }
  }

  try {
    // Make request to backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      // Don't use credentials: 'include' here as we're manually forwarding cookies
    });

    // For no-content responses, return without a body to satisfy Response constraints
    if (response.status === 204 || response.status === 304) {
      return new NextResponse(null, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    // Check if this is a binary response (image, file, etc)
    const contentType = response.headers.get("content-type") || "";
    const isBinary = contentType.startsWith("image/") ||
      contentType.startsWith("application/octet-stream") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/");

    // Get response body based on type
    const responseBody = isBinary ? await response.arrayBuffer() : await response.text();

    // Create response with same status
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Forward response headers except ones that no longer apply after decompression
    response.headers.forEach((value, key) => {
      const headerKey = key.toLowerCase();
      if (headerKey === "set-cookie") {
        return;
      }

      // Skip compression and length headers since fetch already decoded the body
      if (headerKey === "content-encoding" || headerKey === "content-length") {
        return;
      }

      nextResponse.headers.set(key, value);
    });

    // Handle Set-Cookie specially - fetch API returns it as a single string
    // but we need to preserve multiple Set-Cookie headers
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      // Split by comma followed by space and attribute names (like Secure, HttpOnly, etc.)
      // This is a simplification - for robust handling we'd need a proper cookie parser
      nextResponse.headers.set("set-cookie", setCookieHeader);
      console.log(`[API Proxy] Forwarding Set-Cookie: ${setCookieHeader}`);
    }

    console.log(`[API Proxy] ${method} ${fullUrl} - ${response.status}`);

    return nextResponse;
  } catch (error) {
    console.error(`[API Proxy] Error proxying ${method} ${fullUrl}:`, error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
