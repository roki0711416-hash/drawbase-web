import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Allowed CORS origins.
 * In production, restricts to known domains.
 * Always allows localhost for development.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (webUrl) origins.push(webUrl.replace(/\/$/, ""));
  if (appUrl && appUrl !== webUrl) origins.push(appUrl.replace(/\/$/, ""));

  // Always allow localhost for development
  origins.push("http://localhost:3000");
  origins.push("http://localhost:3001");

  return origins;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = getAllowedOrigins();
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Set origin-specific header for known origins (browser requests),
    // wildcard for non-browser clients (iOS app, curl, etc.)
    response.headers.set(
      "Access-Control-Allow-Origin",
      isAllowedOrigin ? origin : "*"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    // Allow credentials for known origins (cookie-based auth)
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
