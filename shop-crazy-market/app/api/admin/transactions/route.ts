import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/transactions
 * Get all transactions (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await requireAdmin(userId);

    const transactions = await prisma.order.findMany({
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000, // Limit to last 1000 transactions
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: error.message === "Admin access required" ? 403 : 500 }
    );
  }
}

