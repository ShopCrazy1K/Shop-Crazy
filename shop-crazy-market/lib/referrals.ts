import { prisma } from "@/lib/prisma";
import { addStoreCredit } from "@/lib/store-credit";

const REFERRAL_REWARD_CENTS = 500; // $5.00

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  // Check if user already has a referral code
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (user?.referralCode) {
    return user.referralCode;
  }

  // Generate a unique code (8 characters, alphanumeric)
  let code: string = userId.substring(0, 8).toUpperCase(); // Initialize with fallback
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    // Generate code from user ID + random chars
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const userIdPart = userId.substring(0, 4).toUpperCase();
    const candidateCode = `${userIdPart}${randomPart}`;

    // Check if code already exists
    const existing = await prisma.user.findUnique({
      where: { referralCode: candidateCode },
      select: { id: true },
    });

    if (!existing) {
      code = candidateCode;
      isUnique = true;
    }
    attempts++;
  }

  // Save referral code to user
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });

  return code;
}

/**
 * Process a referral when a new user signs up
 * Awards $5 store credit to the referrer
 */
export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<{ success: boolean; referrerId?: string; error?: string }> {
  try {
    // Find the referrer by their referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: { id: true, email: true },
    });

    if (!referrer) {
      return { success: false, error: "Invalid referral code" };
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      return { success: false, error: "Cannot refer yourself" };
    }

    // Check if user was already referred (prevent duplicate rewards)
    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { referredBy: true },
    });

    if (newUser?.referredBy) {
      return { success: false, error: "User already has a referrer" };
    }

    // Update new user with referrer
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredBy: referrer.id },
    });

    // Award $5 store credit to referrer
    await addStoreCredit(
      referrer.id,
      REFERRAL_REWARD_CENTS,
      `Referral reward for ${newUserId}`
    );

    // Create credit ledger entry
    await prisma.creditLedger.create({
      data: {
        userId: referrer.id,
        funder: "PLATFORM",
        reason: `REFERRAL_REWARD`,
        amount: REFERRAL_REWARD_CENTS,
      },
    });

    console.log(
      `[REFERRAL] User ${referrer.id} earned $${REFERRAL_REWARD_CENTS / 100} for referring ${newUserId}`
    );

    return { success: true, referrerId: referrer.id };
  } catch (error: any) {
    console.error("[REFERRAL] Error processing referral:", error);
    return { success: false, error: error.message || "Failed to process referral" };
  }
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string) {
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

  return {
    referralCount,
    totalEarned: totalEarned._sum.amount || 0,
    totalEarnedDollars: (totalEarned._sum.amount || 0) / 100,
  };
}

