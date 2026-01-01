import { prisma } from "@/lib/prisma";

/**
 * Adds store credit to buyer. 
 * 
 * IMPORTANT: This does NOT require money in your Stripe balance.
 * Store credit is issued instantly without any cash refund.
 * The cost comes later when the customer uses it on a future order,
 * reducing what you collect on that next purchase.
 * 
 * You can decide if this is platform-funded or seller-funded.
 * If you want $0 cost to you, make it SELLER-funded + sellerId required.
 */
export async function issueStoreCredit(params: {
  userId: string;
  sellerId?: string;
  amount: number; // cents
  reason: string; // e.g. "Refund for Order #123"
  expiresInDays?: number;
}) {
  const { userId, sellerId, amount, reason, expiresInDays } = params;

  const expiresAt =
    typeof expiresInDays === "number"
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

  // ✅ LEDGER-BASED credit (recommended)
  // This creates an audit trail of all credit transactions
  await prisma.creditLedger.create({
    data: {
      userId,
      sellerId: sellerId ?? null,
      funder: sellerId ? "SELLER" : "PLATFORM",
      reason: reason || "REFUND",
      amount,
      expiresAt,
    },
  });

  // Update the user's storeCredit balance for immediate use
  // This is the actual balance they can spend
  await prisma.user.update({
    where: { id: userId },
    data: { storeCredit: { increment: amount } },
  });

  console.log(`[STORE CREDIT] Issued ${amount} cents to user ${userId}. Reason: ${reason}. No Stripe balance required.`);

  return { ok: true, expiresAt, note: reason };
}

