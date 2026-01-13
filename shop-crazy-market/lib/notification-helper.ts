/**
 * Helper functions for creating notifications
 * Centralized notification creation with consistent formatting
 */

import { prisma } from "./prisma";

export interface CreateNotificationParams {
  userId: string;
  type: "message" | "order" | "review" | "dmca" | "strike" | "copyright" | "listing" | "refund" | "other";
  title: string;
  message: string;
  link?: string | null;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        read: false,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications are non-critical
    return null;
  }
}

/**
 * Create notification for new message
 */
export async function notifyNewMessage(receiverId: string, senderName: string, senderId: string) {
  return createNotification({
    userId: receiverId,
    type: "message",
    title: "New Message",
    message: `You have a new message from ${senderName}`,
    link: `/messages/${senderId}`,
  });
}

/**
 * Create notification for DMCA complaint filed
 */
export async function notifyDMCAComplaint(sellerId: string, listingTitle: string, complaintId: string) {
  return createNotification({
    userId: sellerId,
    type: "dmca",
    title: "DMCA Complaint Filed",
    message: `A DMCA complaint has been filed against your listing: "${listingTitle}"`,
    link: `/dmca/counter-notice?complaintId=${complaintId}&listingId=${complaintId}`,
  });
}

/**
 * Create notification for copyright strike
 */
export async function notifyCopyrightStrike(sellerId: string, strikeCount: number, reason: string) {
  const action = strikeCount >= 3 ? "banned" : strikeCount >= 2 ? "suspended" : "warned";
  return createNotification({
    userId: sellerId,
    type: "strike",
    title: `Copyright Violation - Account ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    message: `You have been ${action} for a copyright violation. Strike count: ${strikeCount}/3. Reason: ${reason}`,
    link: `/seller/dashboard`,
  });
}

/**
 * Create notification for listing flagged
 */
export async function notifyListingFlagged(sellerId: string, listingTitle: string, flaggedWords: string[]) {
  return createNotification({
    userId: sellerId,
    type: "copyright",
    title: "Listing Flagged for Review",
    message: `Your listing "${listingTitle}" has been flagged for potential copyright/trademark violations. Flagged words: ${flaggedWords.join(", ")}`,
    link: `/listings/${listingTitle}`,
  });
}

/**
 * Create notification for order placed
 */
export async function notifyOrderPlaced(sellerId: string, orderId: string, buyerName: string) {
  return createNotification({
    userId: sellerId,
    type: "order",
    title: "New Order",
    message: `You have a new order from ${buyerName}`,
    link: `/orders/${orderId}`,
  });
}

/**
 * Create notification for review received
 */
export async function notifyReviewReceived(sellerId: string, reviewerName: string, rating: number) {
  return createNotification({
    userId: sellerId,
    type: "review",
    title: "New Review",
    message: `${reviewerName} left you a ${rating}-star review`,
    link: `/seller/reviews`,
  });
}
