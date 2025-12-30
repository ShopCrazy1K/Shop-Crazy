import { NextResponse } from "next/server";
import { getUserByEmail, verifyPassword } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Apply rate limiting for auth endpoints
  const limitResult = await rateLimiters.auth(req);
  
  if (!limitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitResult.resetTime.toString(),
          'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (OAuth users don't have passwordHash)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was created with social login. Please use social login to sign in." },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Return user (without password hash)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}

