/**
 * Example API route with rate limiting
 * This demonstrates how to use rate limiting in your API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimiters, withRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Example handler without rate limiting wrapper
export async function GET(req: NextRequest) {
  // Apply rate limiting
  const limitResult = await rateLimiters.standard(req);
  
  if (!limitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitResult.resetTime.toString(),
          'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Your actual handler logic here
  return NextResponse.json(
    {
      message: "Success!",
      rateLimit: {
        remaining: limitResult.remaining,
        resetTime: limitResult.resetTime,
      },
    },
    {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': limitResult.remaining.toString(),
        'X-RateLimit-Reset': limitResult.resetTime.toString(),
      },
    }
  );
}

// Example using the withRateLimit wrapper (alternative approach)
const handler = async (req: NextRequest) => {
  return NextResponse.json({ message: "Success with wrapper!" });
};

// Uncomment to use the wrapper approach:
// export const POST = withRateLimit(handler, rateLimiters.strict);

