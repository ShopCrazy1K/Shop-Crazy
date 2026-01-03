import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableStoreCredit } from "@/lib/store-credit";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/users/[userId]/store-credit
 * Get user's store credit balance (with expiration validation)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        storeCredit: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get available credit (excluding expired)
    const creditInfo = await getAvailableStoreCredit(userId);

    return NextResponse.json({
      storeCredit: creditInfo.available, // Return available (non-expired) credit
      storeCreditDollars: creditInfo.available / 100,
      total: creditInfo.total,
      expired: creditInfo.expired,
    });
  } catch (error: any) {
    console.error("Error fetching store credit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch store credit" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/store-credit
 * Add store credit to user's account (admin only or for refunds)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { amountCents, reason } = body;

    if (!amountCents || amountCents <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, storeCredit: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newBalance = (user.storeCredit || 0) + amountCents;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        storeCredit: newBalance,
      },
    });

    console.log(`[STORE CREDIT] Added ${amountCents} cents to user ${userId}. Reason: ${reason || 'N/A'}. New balance: ${newBalance}`);

    return NextResponse.json({
      success: true,
      storeCredit: updated.storeCredit,
      storeCreditDollars: updated.storeCredit / 100,
      added: amountCents,
      addedDollars: amountCents / 100,
    });
  } catch (error: any) {
    console.error("Error adding store credit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add store credit" },
      { status: 500 }
    );
  }
}

