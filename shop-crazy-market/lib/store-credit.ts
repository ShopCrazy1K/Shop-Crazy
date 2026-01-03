import { prisma } from "@/lib/prisma";

const WELCOME_CREDIT = 500; // $5 = 500 cents

/**
 * Get available store credit for a user (excluding expired credits)
 * Uses FIFO (First-In-First-Out) by expiration date
 */
export async function getAvailableStoreCredit(userId: string): Promise<{
  total: number;
  available: number;
  expired: number;
  credits: Array<{ id: string; amount: number; expiresAt: Date | null; createdAt: Date }>;
}> {
  const now = new Date();
  
  // Get all credit ledger entries for this user
  const credits = await prisma.creditLedger.findMany({
    where: { userId },
    orderBy: [
      { expiresAt: 'asc' }, // Expiring credits first
      { createdAt: 'asc' }, // Then by creation date
    ],
  });

  // Calculate total and filter expired
  let total = 0;
  let expired = 0;
  const availableCredits: Array<{ id: string; amount: number; expiresAt: Date | null; createdAt: Date }> = [];

  for (const credit of credits) {
    total += credit.amount;
    
    // Check if expired
    if (credit.expiresAt && credit.expiresAt < now) {
      expired += credit.amount;
    } else {
      availableCredits.push({
        id: credit.id,
        amount: credit.amount,
        expiresAt: credit.expiresAt,
        createdAt: credit.createdAt,
      });
    }
  }

  const available = total - expired;

  return {
    total,
    available,
    expired,
    credits: availableCredits,
  };
}

/**
 * Use store credit with FIFO expiration handling
 * Deducts from expiring credits first
 */
export async function useStoreCredit(
  userId: string,
  amountCents: number,
  orderId: string
): Promise<{ success: boolean; used: number; remaining: number; error?: string }> {
  try {
    const now = new Date();
    
    // Get available credits (non-expired, sorted by expiration)
    const credits = await prisma.creditLedger.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { expiresAt: 'asc' }, // Use expiring credits first
        { createdAt: 'asc' },
      ],
    });

    // Calculate total available
    const totalAvailable = credits.reduce((sum, c) => sum + c.amount, 0);
    
    if (totalAvailable < amountCents) {
      return {
        success: false,
        used: 0,
        remaining: totalAvailable,
        error: `Insufficient store credit. Available: $${(totalAvailable / 100).toFixed(2)}`,
      };
    }

    // Deduct credits using FIFO
    let remainingToDeduct = amountCents;
    const creditsToUpdate: Array<{ id: string; newAmount: number }> = [];

    for (const credit of credits) {
      if (remainingToDeduct <= 0) break;

      if (credit.amount <= remainingToDeduct) {
        // Use entire credit
        creditsToUpdate.push({ id: credit.id, newAmount: 0 });
        remainingToDeduct -= credit.amount;
      } else {
        // Partial use
        creditsToUpdate.push({ id: credit.id, newAmount: credit.amount - remainingToDeduct });
        remainingToDeduct = 0;
      }
    }

    // Update credits in database
    for (const update of creditsToUpdate) {
      if (update.newAmount === 0) {
        // Delete if fully used
        await prisma.creditLedger.delete({ where: { id: update.id } });
      } else {
        // Update amount
        await prisma.creditLedger.update({
          where: { id: update.id },
          data: { amount: update.newAmount },
        });
      }
    }

    // Update user's store credit balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storeCredit: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = Math.max(0, (user.storeCredit || 0) - amountCents);
    
    await prisma.user.update({
      where: { id: userId },
      data: { storeCredit: newBalance },
    });

    // Create a ledger entry for the usage
    await prisma.creditLedger.create({
      data: {
        userId,
        funder: "PLATFORM",
        reason: `USED_FOR_ORDER_${orderId}`,
        amount: -amountCents, // Negative for usage
        expiresAt: null,
      },
    });

    console.log(`[STORE CREDIT] Used ${amountCents} cents from user ${userId} for order ${orderId}. New balance: ${newBalance}`);

    return {
      success: true,
      used: amountCents,
      remaining: newBalance,
    };
  } catch (error: any) {
    console.error("[STORE CREDIT] Error using store credit:", error);
    return {
      success: false,
      used: 0,
      remaining: 0,
      error: error.message,
    };
  }
}

/**
 * Restore store credit if checkout fails
 */
export async function restoreStoreCredit(
  userId: string,
  amountCents: number,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Restore to user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        storeCredit: { increment: amountCents },
      },
    });

    // Create ledger entry for restoration
    await prisma.creditLedger.create({
      data: {
        userId,
        funder: "PLATFORM",
        reason: `RESTORED_FROM_FAILED_ORDER_${orderId}`,
        amount: amountCents,
        expiresAt: null,
      },
    });

    console.log(`[STORE CREDIT] Restored ${amountCents} cents to user ${userId} from failed order ${orderId}`);

    return { success: true };
  } catch (error: any) {
    console.error("[STORE CREDIT] Error restoring store credit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Award store credit to user when they complete their first order
 * Fixed to work with digital items (awards on payment, not delivery)
 */
export async function awardFirstOrderCredit(userId: string, orderId: string) {
  try {
    // Check if user already received first order credit
    const existingCredit = await prisma.creditLedger.findFirst({
      where: {
        userId,
        reason: "WELCOME_BONUS",
      },
    });

    if (existingCredit) {
      return { success: false, message: "First order credit already awarded" };
    }

    // Count paid orders for this user (including this one)
    const paidOrders = await prisma.order.count({
      where: { 
        userId, 
        paymentStatus: "paid",
      },
    });

    // If this is their first paid order, award welcome credit
    if (paidOrders === 1) {
      // Create ledger entry
      await prisma.creditLedger.create({
        data: {
          userId,
          funder: "PLATFORM",
          reason: "WELCOME_BONUS",
          amount: WELCOME_CREDIT,
          expiresAt: null, // Welcome credit doesn't expire
        },
      });

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          storeCredit: { increment: WELCOME_CREDIT },
        },
      });

      console.log(`[STORE CREDIT] Awarded $${WELCOME_CREDIT / 100} welcome credit to user ${userId} for first paid order ${orderId}`);
      
      return {
        success: true,
        amount: WELCOME_CREDIT,
        message: `Congratulations! You've earned $${WELCOME_CREDIT / 100} store credit for your first order!`,
      };
    }

    return { success: false, message: "Not first order or user not found" };
  } catch (error: any) {
    console.error("[STORE CREDIT] Error awarding first order credit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Award store credit to user (for refunds, promotions, etc.)
 * Creates ledger entry and updates balance
 */
export async function addStoreCredit(
  userId: string,
  amountCents: number,
  reason?: string,
  expiresInDays?: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, storeCredit: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const expiresAt =
      typeof expiresInDays === "number"
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;

    // Create ledger entry
    await prisma.creditLedger.create({
      data: {
        userId,
        funder: "PLATFORM",
        reason: reason || "MANUAL_CREDIT",
        amount: amountCents,
        expiresAt,
      },
    });

    // Update user balance
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        storeCredit: { increment: amountCents },
      },
    });

    console.log(`[STORE CREDIT] Added ${amountCents} cents to user ${userId}. Reason: ${reason || 'N/A'}. New balance: ${updated.storeCredit}`);

    return {
      success: true,
      storeCredit: updated.storeCredit,
      storeCreditDollars: updated.storeCredit / 100,
      added: amountCents,
      addedDollars: amountCents / 100,
    };
  } catch (error: any) {
    console.error("[STORE CREDIT] Error adding store credit:", error);
    throw error;
  }
}

