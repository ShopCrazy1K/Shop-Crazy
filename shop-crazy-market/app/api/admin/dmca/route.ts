import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { addStrike } from "@/lib/strike-system";
import {
  sendDMCAComplaintValidatedEmail,
} from "@/lib/email";

// Get all DMCA complaints
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
    
    const [complaints, total] = await Promise.all([
      prisma.dMCAComplaint.findMany({
        where,
        include: {
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
          counterNotice: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.dMCAComplaint.count({ where }),
    ]);
    
    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin DMCA list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch DMCA complaints" },
      { status: 500 }
    );
  }
}

// Update DMCA complaint status
export async function PATCH(req: NextRequest) {
  try {
    const adminId = req.headers.get("x-user-id");
    await requireAdmin(adminId);
    
    const body = await req.json();
    const { complaintId, status, adminNotes, addStrike: shouldAddStrike } = body;
    
    if (!complaintId || !status) {
      return NextResponse.json(
        { error: "complaintId and status are required" },
        { status: 400 }
      );
    }
    
    const complaint = await prisma.dMCAComplaint.findUnique({
      where: { id: complaintId },
      include: { 
        listing: true,
        counterNotice: true,
      },
    });
    
    if (!complaint) {
      return NextResponse.json(
        { error: "DMCA complaint not found" },
        { status: 404 }
      );
    }
    
    // Update complaint
    const updated = await prisma.dMCAComplaint.update({
      where: { id: complaintId },
      data: {
        status,
        adminNotes,
        reviewedBy: adminId || null,
        reviewedAt: new Date(),
      },
    });
    
    // Update listing status based on complaint resolution
    if (status === "VALID") {
      // Valid complaint - disable listing
      await prisma.listing.update({
        where: { id: complaint.listingId },
        data: {
          copyrightStatus: "DISABLED",
          isActive: false,
        },
      });
      
      // Add strike if requested
      if (shouldAddStrike) {
        await addStrike(
          complaint.listing.sellerId,
          `DMCA complaint validated: ${complaint.copyrightedWork}`,
          complaintId,
          "COPYRIGHT"
        );
      }
      
      // Send email to complainant
      await sendDMCAComplaintValidatedEmail(
        complaint.complainantEmail,
        complaintId,
        complaint.listing.title
      ).catch(err => console.error("Failed to send validation email:", err));
    } else if (status === "INVALID") {
      // Invalid complaint - restore listing if no counter-notice
      if (!complaint.counterNotice) {
        await prisma.listing.update({
          where: { id: complaint.listingId },
          data: {
            copyrightStatus: "CLEAR",
            isActive: true,
          },
        });
      }
    } else if (status === "RESOLVED") {
      // Resolved - clear status
      await prisma.listing.update({
        where: { id: complaint.listingId },
        data: {
          copyrightStatus: "CLEAR",
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      complaint: updated,
    });
  } catch (error) {
    console.error("Admin DMCA update error:", error);
    return NextResponse.json(
      { error: "Failed to update DMCA complaint" },
      { status: 500 }
    );
  }
}
