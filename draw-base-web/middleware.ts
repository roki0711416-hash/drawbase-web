import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Allowed CORS origins.
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (webUrl) origins.push(webUrl.replace(/\/$/, ""));
  if (appUrl && appUrl !== webUrl) origins.push(appUrl.replace(/\/$/, ""));
  origins.push("http://localhost:3000");
  origins.push("http://localhost:3001");
  return origins;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── API ルートの CORS 処理 ──
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = getAllowedOrigins();
    const isAllowedOrigin = allowedOrigins.includes(origin);

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
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    return response;
  }

  // ── ページ保護 ──
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // /creator/* — 認証必須 + CREATOR or BOTH
  if (pathname.startsWith("/creator")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?role=creator", request.url));
    }
    if (!token.role) {
      return NextResponse.redirect(new URL("/auth/role-select", request.url));
    }
    if (token.role !== "CREATOR" && token.role !== "BOTH") {
      return NextResponse.redirect(new URL("/fan/dashboard", request.url));
    }
  }

  // /fan/* — 認証必須 + FAN or BOTH
  if (pathname.startsWith("/fan")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login?role=fan", request.url));
    }
    if (!token.role) {
      return NextResponse.redirect(new URL("/auth/role-select", request.url));
    }
    if (token.role !== "FAN" && token.role !== "BOTH") {
      return NextResponse.redirect(new URL("/creator/dashboard", request.url));
    }
  }

  // /admin/* — 認証必須 + isAdmin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/creator/:path*", "/fan/:path*", "/admin/:path*"],
};
