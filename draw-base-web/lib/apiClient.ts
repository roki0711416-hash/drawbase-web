/**
 * DRAW BASE API Client
 *
 * Centralized API client for all frontend-to-backend requests.
 * Uses NEXT_PUBLIC_API_URL to support separated frontend/API deployments.
 *
 * - Local dev:  NEXT_PUBLIC_API_URL="" (same origin, /api/... routes on localhost:3000)
 * - Production: NEXT_PUBLIC_API_URL="https://api.drawbase.net"
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Construct the full API URL from a path.
 * @param path - API path starting with /api/...
 * @returns Full URL (e.g., "https://api.drawbase.net/api/posts/feed")
 */
export function apiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Fetch wrapper that automatically prepends the API base URL.
 * Drop-in replacement for native fetch() for API calls.
 *
 * @param path - API path (e.g., "/api/posts/feed?sort=latest")
 * @param options - Standard RequestInit options
 * @returns Promise<Response>
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = apiUrl(path);
  return fetch(url, {
    ...options,
    credentials: API_BASE_URL ? "include" : (options?.credentials ?? "same-origin"),
  });
}
