import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// Get all counter-notices
export async function GET(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    const [counterNotices, total] = await Promise.all([
      prisma.counterNotice.findMany({
        where,
        include: {
          complaint: true,
          listing: {
            include: {
              seller: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.counterNotice.count({ where }),
    ]);
    
    return NextResponse.json({
      counterNotices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin counter-notice list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch counter-notices" },
      { status: 500 }
    );
  }
}

// Update counter-notice status
export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);
    
    const body = await req.json();
    const { counterNoticeId, status, adminNotes } = body;
    
    if (!counterNoticeId || !status) {
      return NextResponse.json(
        { error: "counterNoticeId and status are required" },
        { status: 400 }
      );
    }
    
    const counterNotice = await prisma.counterNotice.findUnique({
      where: { id: counterNoticeId },
      include: { listing: true, complaint: true },
    });
    
    if (!counterNotice) {
      return NextResponse.json(
        { error: "Counter-notice not found" },
        { status: 404 }
      );
    }
    
    // Update counter-notice
    const updated = await prisma.counterNotice.update({
      where: { id: counterNoticeId },
      data: {
        status,
        adminNotes,
        reviewedBy: adminId || null,
        reviewedAt: new Date(),
      },
    });
    
    // Update listing and complaint based on counter-notice resolution
    if (status === "APPROVED") {
      // Approved counter-notice - restore listing
      await prisma.listing.update({
        where: { id: counterNotice.listingId },
        data: {
          copyrightStatus: "CLEAR",
          isActive: true,
        },
      });
      
      // Update complaint status
      await prisma.dMCAComplaint.update({
        where: { id: counterNotice.complaintId },
        data: {
          status: "RESOLVED",
        },
      });
    } else if (status === "REJECTED") {
      // Rejected counter-notice - keep listing disabled
      await prisma.listing.update({
        where: { id: counterNotice.listingId },
        data: {
          copyrightStatus: "DISABLED",
          isActive: false,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      counterNotice: updated,
    });
  } catch (error) {
    console.error("Admin counter-notice update error:", error);
    return NextResponse.json(
      { error: "Failed to update counter-notice" },
      { status: 500 }
    );
  }
}
