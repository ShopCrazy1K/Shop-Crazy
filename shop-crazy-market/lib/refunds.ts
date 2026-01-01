import { prisma } from "@/lib/prisma";

/**
 * Adds store credit to buyer. You can decide if this is platform-funded or seller-funded.
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

  // SIMPLE PLATFORM CREDIT (costs you when used):
  // await prisma.user.update({ where: { id: userId }, data: { storeCredit: { increment: amount } } });

  // ✅ LEDGER-BASED credit (recommended). If you already use a ledger, use this:
  await prisma.creditLedger.create({
    data: {
      userId,
      sellerId: sellerId ?? null,
      funder: sellerId ? "SELLER" : "PLATFORM",
      reason: "REFUND",
      amount,
      expiresAt,
    },
  });

  // Also update the user's storeCredit balance for immediate use
  await prisma.user.update({
    where: { id: userId },
    data: { storeCredit: { increment: amount } },
  });

  return { ok: true, expiresAt, note: reason };
}

