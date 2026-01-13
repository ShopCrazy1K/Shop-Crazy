/**
 * Strike system for copyright/IP violations
 * 1 strike = Warning
 * 2 strikes = Suspend seller
 * 3 strikes = Ban seller
 */

import { prisma } from "./prisma";
import { sendStrikeIssuedEmail } from "./email";

export interface StrikeAction {
  action: "WARN" | "SUSPEND" | "BAN";
  message: string;
}

/**
 * Get strike count for a seller
 */
export async function getStrikeCount(sellerId: string): Promise<number> {
  const activeStrikes = await prisma.sellerStrike.count({
    where: {
      sellerId,
      status: "ACTIVE",
    },
  });
  
  return activeStrikes;
}

/**
 * Get strike action based on count
 */
export function getStrikeAction(strikeCount: number): StrikeAction {
  if (strikeCount >= 3) {
    return {
      action: "BAN",
      message: "Your account has been permanently banned due to repeated copyright violations.",
    };
  } else if (strikeCount >= 2) {
    return {
      action: "SUSPEND",
      message: "Your account has been suspended due to multiple copyright violations. Please contact support to appeal.",
    };
  } else if (strikeCount >= 1) {
    return {
      action: "WARN",
      message: "You have received a warning for a copyright violation. Further violations may result in account suspension.",
    };
  }
  
  return {
    action: "WARN",
    message: "",
  };
}

/**
 * Add a strike to a seller
 */
export async function addStrike(
  sellerId: string,
  reason: string,
  complaintId?: string,
  strikeType: string = "COPYRIGHT"
): Promise<{ strikeId: string; strikeCount: number; action: StrikeAction }> {
  const strike = await prisma.sellerStrike.create({
    data: {
      sellerId,
      reason,
      complaintId,
      strikeType,
      status: "ACTIVE",
    },
  });
  
  const strikeCount = await getStrikeCount(sellerId);
  const action = getStrikeAction(strikeCount);
  
  // Get seller email for notification
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { email: true },
  });
  
  // Apply action
  if (action.action === "BAN") {
    // Ban seller - disable all listings and prevent new listings
    await prisma.user.update({
      where: { id: sellerId },
      data: { role: "BANNED" }, // You may need to add this role to your User model
    });
    
    // Disable all active listings
    await prisma.listing.updateMany({
      where: { sellerId, isActive: true },
      data: { isActive: false, copyrightStatus: "DISABLED" },
    });
  } else if (action.action === "SUSPEND") {
    // Suspend seller - disable all listings
    await prisma.listing.updateMany({
      where: { sellerId, isActive: true },
      data: { isActive: false, copyrightStatus: "DISABLED" },
    });
  }
  
  // Send email notification
  if (seller?.email) {
    await sendStrikeIssuedEmail(
      seller.email,
      strikeCount,
      reason,
      action.action
    ).catch(err => console.error("Failed to send strike email:", err));
  }
  
  return {
    strikeId: strike.id,
    strikeCount,
    action,
  };
}

/**
 * Check if seller is suspended or banned
 */
export async function isSellerSuspended(sellerId: string): Promise<boolean> {
  const strikeCount = await getStrikeCount(sellerId);
  return strikeCount >= 2;
}

/**
 * Check if seller is banned
 */
export async function isSellerBanned(sellerId: string): Promise<boolean> {
  const strikeCount = await getStrikeCount(sellerId);
  return strikeCount >= 3;
}
