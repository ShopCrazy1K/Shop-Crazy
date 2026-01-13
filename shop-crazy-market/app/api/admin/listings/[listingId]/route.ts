import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Ctx = { params: Promise<{ listingId: string }> };

/**
 * POST /api/admin/listings/[listingId]
 * Activate, deactivate, or delete a listing (admin only)
 */
export async function POST(req: NextRequest, context: Ctx) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);

    const { listingId } = await context.params;
    const body = await req.json();
    const { action } = body;

    if (!["activate", "deactivate", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'activate', 'deactivate', or 'delete'" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (action === "delete") {
      // Delete listing
      await prisma.listing.delete({
        where: { id: listingId },
      });
    } else if (action === "activate") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { isActive: true },
      });
    } else if (action === "deactivate") {
      await prisma.listing.update({
        where: { id: listingId },
        data: { isActive: false },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Listing ${action}d successfully`,
    });
  } catch (error: any) {
    console.error("Error performing listing action:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform action" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/listings/[listingId]
 * Copyright/IP admin actions: disable, restore, flag, hide, suspend seller, etc.
 */
export async function PATCH(req: NextRequest, context: Ctx) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);
    
    const { listingId } = await context.params;
    const body = await req.json();
    const { action, reason, adminNotes } = body;
    
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    let updateData: any = {};
    let strikeData: any = null;
    
    switch (action) {
      case "DISABLE":
        updateData = {
          copyrightStatus: "DISABLED",
          isActive: false,
          flaggedReason: reason || "Disabled by administrator",
        };
        break;
        
      case "RESTORE":
        updateData = {
          copyrightStatus: "CLEAR",
          isActive: true,
          flaggedReason: null,
        };
        break;
        
      case "FLAG":
        updateData = {
          copyrightStatus: "FLAGGED",
          flaggedReason: reason || "Flagged by administrator",
        };
        break;
        
      case "HIDE":
        updateData = {
          copyrightStatus: "HIDDEN",
          isActive: false,
          flaggedReason: reason || "Hidden by administrator",
        };
        break;
        
      case "SUSPEND_SELLER":
        // Suspend seller - disable all their listings
        await prisma.listing.updateMany({
          where: { sellerId: listing.sellerId, isActive: true },
          data: {
            copyrightStatus: "DISABLED",
            isActive: false,
            flaggedReason: reason || "Seller suspended",
          },
        });
        
        strikeData = {
          sellerId: listing.sellerId,
          reason: reason || "Seller suspended by administrator",
          strikeType: "OTHER",
          adminNotes,
        };
        break;
        
      case "UNSUSPEND_SELLER":
        // Unsuspend seller - restore their listings
        await prisma.listing.updateMany({
          where: { sellerId: listing.sellerId, copyrightStatus: "DISABLED" },
          data: {
            copyrightStatus: "CLEAR",
            isActive: true,
            flaggedReason: null,
          },
        });
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    // Update listing if action is not seller-level
    if (action !== "SUSPEND_SELLER" && action !== "UNSUSPEND_SELLER") {
      if (adminNotes) {
        updateData.flaggedReason = (updateData.flaggedReason || "") + `\nAdmin Notes: ${adminNotes}`;
      }
      
      await prisma.listing.update({
        where: { id: listingId },
        data: updateData,
      });
    }
    
    // Add strike if suspending seller
    if (strikeData) {
      await prisma.sellerStrike.create({
        data: strikeData,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Action "${action}" completed successfully`,
    });
  } catch (error) {
    console.error("Admin listing action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/listings/[listingId]
 * Get listing details for admin (including copyright/IP info)
 */
export async function GET(req: NextRequest, context: Ctx) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);
    
    const { listingId } = await context.params;
    
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
        dmcaComplaints: {
          include: {
            counterNotice: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    // Get seller strikes
    const strikes = await prisma.sellerStrike.findMany({
      where: {
        sellerId: listing.sellerId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({
      listing,
      strikes,
    });
  } catch (error) {
    console.error("Admin listing get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
