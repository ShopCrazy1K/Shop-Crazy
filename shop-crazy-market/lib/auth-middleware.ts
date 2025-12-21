import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    role: string;
  };
}

/**
 * Authentication middleware for API routes
 * Extracts userId from request headers or body
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  // Try to get userId from headers first
  let userId = request.headers.get("x-user-id");

  // If not in headers, try to get from request body (for POST requests)
  if (!userId) {
    try {
      const body = await request.clone().json().catch(() => ({}));
      userId = body.userId;
    } catch {
      // Body might not be JSON or might be empty
    }
  }

  // If still no userId, try to get from query params
  if (!userId) {
    const { searchParams } = new URL(request.url);
    userId = searchParams.get("userId");
  }

  if (!userId) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Verify user exists
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        ),
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  return authenticateRequest(request);
}

/**
 * Optional authentication - returns user if available, null otherwise
 */
export async function optionalAuth(
  request: NextRequest
): Promise<{ user: any | null }> {
  const result = await authenticateRequest(request);
  if (result.error) {
    return { user: null };
  }
  return { user: result.user };
}

