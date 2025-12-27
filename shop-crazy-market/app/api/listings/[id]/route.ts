import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

// GET - Fetch a single listing
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");
    
    console.log("[API LISTINGS ID] Fetching listing with ID:", id, "userId:", userId || "guest");
    
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
        listing = listingBySlug;
      } else {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
    }

    // For guest users (no userId), only show active listings
    // For authenticated users, show all listings (they can see their own inactive listings)
    if (!userId && !listing.isActive) {
      console.log("[API LISTINGS ID] Guest user trying to access inactive listing:", listing.id);
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // If user is authenticated but not the owner, only show active listings
    if (userId && listing.sellerId !== userId && !listing.isActive) {
      console.log("[API LISTINGS ID] Non-owner trying to access inactive listing:", listing.id);
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    console.log("[API LISTINGS ID] Listing found:", listing.id, "isActive:", listing.isActive);
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

// PUT - Update a listing
export async function PUT(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Verify the listing belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized. You can only edit your own listings." },
        { status: 403 }
      );
    }

    // Update the listing
    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        priceCents: body.priceCents,
        images: body.images || [],
        digitalFiles: body.digitalFiles || [],
      },
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

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[API LISTINGS ID] Error updating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a listing
export async function DELETE(req: NextRequest, context: Ctx) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Verify the listing belongs to the user
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized. You can only delete your own listings." },
        { status: 403 }
      );
    }

    // Delete the listing
    await prisma.listing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Listing deleted successfully" });
  } catch (error: any) {
    console.error("[API LISTINGS ID] Error deleting listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}
