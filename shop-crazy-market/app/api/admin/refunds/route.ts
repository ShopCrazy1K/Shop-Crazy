import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/refunds
 * Get all refunds for admin dashboard (with new refund system)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const whereClause: any = {
      refundStatus: { not: "NONE" },
    };

    if (status) {
      whereClause.refundStatus = status;
    }

    if (type) {
      whereClause.refundType = type;
    }

    const refunds = await prisma.order.findMany({
      where: whereClause,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Count by status
    const statusCounts = await prisma.order.groupBy({
      by: ["refundStatus"],
      where: {
        refundStatus: { not: "NONE" },
      },
      _count: true,
    });

    const counts: Record<string, number> = {};
    statusCounts.forEach((count) => {
      counts[count.refundStatus || "NONE"] = count._count;
    });

    // Count by type
    const typeCounts = await prisma.order.groupBy({
      by: ["refundType"],
      where: {
        refundStatus: { not: "NONE" },
      },
      _count: true,
    });

    const typeCountsMap: Record<string, number> = {};
    typeCounts.forEach((count) => {
      if (count.refundType) {
        typeCountsMap[count.refundType] = count._count;
      }
    });

    return NextResponse.json({
      refunds,
      counts: {
        total: refunds.length,
        requested: counts["REQUESTED"] || 0,
        approved: counts["APPROVED"] || 0,
        processing: counts["PROCESSING"] || 0,
        completed: counts["COMPLETED"] || 0,
        rejected: counts["REJECTED"] || 0,
      },
      typeCounts: {
        credit: typeCountsMap["CREDIT"] || 0,
        cash: typeCountsMap["CASH"] || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching admin refunds:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

