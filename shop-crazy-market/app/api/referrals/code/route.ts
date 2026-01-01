import { NextRequest, NextResponse } from "next/server";
import { generateReferralCode } from "@/lib/referrals";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/referrals/code?userId=xxx
 * Get or generate referral code for a user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    // Get or generate referral code
    const code = await generateReferralCode(userId);

    // Get referral stats
    const referralCount = await prisma.user.count({
      where: { referredBy: userId },
    });

    const totalEarned = await prisma.creditLedger.aggregate({
      where: {
        userId,
        reason: "REFERRAL_REWARD",
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      referralCode: code,
      referralLink: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/signup?ref=${code}`,
      stats: {
        referralCount,
        totalEarned: totalEarned._sum.amount || 0,
        totalEarnedDollars: (totalEarned._sum.amount || 0) / 100,
      },
    });
  } catch (error: any) {
    console.error("Error getting referral code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get referral code" },
      { status: 500 }
    );
  }
}

