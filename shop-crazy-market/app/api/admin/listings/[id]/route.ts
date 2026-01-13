import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Admin actions on listings: disable, restore, suspend seller, etc.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }
    
    const listingId = params.id;
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

// Get listing details for admin
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }
    
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
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
