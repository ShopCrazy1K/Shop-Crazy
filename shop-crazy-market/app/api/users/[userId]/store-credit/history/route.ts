import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/users/[userId]/store-credit/history
 * Get user's store credit transaction history
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const requesterId = req.headers.get("x-user-id");

    // Only allow users to view their own credit history
    if (requesterId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get credit ledger entries
    const ledger = await prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 transactions
    });

    // Format for frontend
    const history = ledger.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      amountDollars: entry.amount / 100,
      reason: entry.reason,
      funder: entry.funder,
      expiresAt: entry.expiresAt,
      createdAt: entry.createdAt,
      isExpired: entry.expiresAt ? entry.expiresAt < new Date() : false,
      isUsage: entry.amount < 0,
    }));

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Error fetching credit history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch credit history" },
      { status: 500 }
    );
  }
}

