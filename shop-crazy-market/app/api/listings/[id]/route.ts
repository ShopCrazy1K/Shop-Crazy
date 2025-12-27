import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    console.log("[API LISTINGS ID] Fetching listing with ID:", id);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("[API LISTINGS ID] DATABASE_URL is not set!");
      return NextResponse.json(
        { 
          error: "Database configuration error. Please contact support.",
          details: "DATABASE_URL environment variable is missing.",
        },
        { status: 500 }
      );
    }

    // Add timeout wrapper for Prisma query with better error handling
    let listing: any;
    try {
      const queryPromise = prisma.listing.findUnique({
        where: { id },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      // Race against timeout (reduced to 4 seconds for faster failure)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database query timeout")), 4000)
      );

      listing = await Promise.race([queryPromise, timeoutPromise]) as any;
    } catch (queryError: any) {
      console.error("[API LISTINGS ID] Query error:", queryError);
      if (queryError.message?.includes("timeout")) {
        return NextResponse.json(
          { 
            error: "Request timed out. The database may be slow to respond.",
            details: "Please try refreshing the page.",
          },
          { status: 504 } // Gateway Timeout
        );
      }
      throw queryError; // Re-throw to be caught by outer catch
    }

    if (!listing) {
      console.log("[API LISTINGS ID] Listing not found for ID:", id);
      // Try to find by slug as fallback
      const slugQueryPromise = prisma.listing.findUnique({
        where: { slug: id },
        include: {
          seller: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      const slugTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database query timeout")), 5000)
      );

      const listingBySlug = await Promise.race([slugQueryPromise, slugTimeoutPromise]) as any;
      
      if (listingBySlug) {
        console.log("[API LISTINGS ID] Found listing by slug:", listingBySlug.id);
        return NextResponse.json(listingBySlug);
      }
      
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    console.log("[API LISTINGS ID] Listing found:", listing.id);
    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("[API LISTINGS ID] Error fetching listing:", error);
    
    // Check for specific database errors
    if (error.message?.includes("prepared statement") || error.message?.includes("42P05")) {
      console.error("[API LISTINGS ID] PgBouncer prepared statement error detected");
      return NextResponse.json(
        { 
          error: "Database connection issue. Please try again in a moment.",
          details: "The database connection pooler is experiencing issues. This usually resolves quickly.",
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    if (error.message?.includes("timeout")) {
      return NextResponse.json(
        { 
          error: "Request timed out. The database may be slow to respond.",
          details: "Please try refreshing the page.",
        },
        { status: 504 } // Gateway Timeout
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

