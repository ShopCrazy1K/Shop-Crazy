import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy middleware for Next.js 16+
 * 
 * Replaces the deprecated middleware.ts convention.
 * Handles security headers and request proxying.
 */
export function middleware(request: NextRequest) {
  // Only apply security headers in production
  if (process.env.NODE_ENV === "production") {
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // HSTS (HTTP Strict Transport Security) - only for HTTPS
    if (request.nextUrl.protocol === "https:") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
  }

  // In development, just pass through
  return NextResponse.next();
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

