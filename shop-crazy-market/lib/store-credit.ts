import { prisma } from "@/lib/prisma";

const WELCOME_CREDIT = 500; // $5 = 500 cents

/**
 * Award store credit to user when they complete their first order
 * This function should be called when an order status changes to "completed"
 */
export async function awardFirstOrderCredit(userId: string) {
  try {
    // Count completed orders for this user
    const completedOrders = await prisma.order.count({
      where: { 
        userId, 
        paymentStatus: "paid", // Using paymentStatus as "completed" equivalent
        shippingStatus: "delivered", // Consider delivered orders as completed
      },
    });

    // If this is their first completed order, award welcome credit
    if (completedOrders === 1) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { storeCredit: true },
      });

      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            storeCredit: { increment: WELCOME_CREDIT },
          },
        });

        console.log(`[STORE CREDIT] Awarded $${WELCOME_CREDIT / 100} welcome credit to user ${userId} for first completed order`);
        
        return {
          success: true,
          amount: WELCOME_CREDIT,
          message: `Congratulations! You've earned $${WELCOME_CREDIT / 100} store credit for your first order!`,
        };
      }
    }

    return { success: false, message: "Credit already awarded or user not found" };
  } catch (error: any) {
    console.error("[STORE CREDIT] Error awarding first order credit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Award store credit to user (for refunds, promotions, etc.)
 */
export async function addStoreCredit(userId: string, amountCents: number, reason?: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, storeCredit: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

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

