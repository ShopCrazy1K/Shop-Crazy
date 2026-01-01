import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueStoreCredit } from "@/lib/refunds";
import { sendRefundStatusEmail, sendEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/refunds/request
 * Request a refund for an order
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, type, reason, amount } = body as {
      orderId: string;
      userId: string;
      type: "CREDIT" | "CASH";
      reason?: string;
      amount?: number; // Optional partial refund amount in cents
    };

    if (!orderId || !userId || !type) {
      return NextResponse.json(
        { error: "orderId, userId, and type are required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ 
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        sellerId: true,
        buyerEmail: true,
        paymentStatus: true,
        shippingStatus: true,
        orderTotalCents: true,
        storeCreditUsedCents: true,
        refundStatus: true,
        refundType: true,
        createdAt: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: This order does not belong to you" },
        { status: 403 }
      );
    }

    // Check if order is completed (paid and delivered)
    if (order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Order must be paid before requesting a refund" },
        { status: 400 }
      );
    }

    if (order.refundStatus !== "NONE") {
      return NextResponse.json(
        { error: "Refund already requested or processed" },
        { status: 400 }
      );
    }

    // Check refund eligibility (30 day window)
    const orderDate = new Date(order.createdAt);
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 30) {
      return NextResponse.json(
        { error: "Refund requests must be made within 30 days of purchase" },
        { status: 400 }
      );
    }

    // Decide refund amount policy (refund what they paid, minus store credit used)
    // If store credit was used, we should only refund the cash portion
    const maxRefundAmount = order.orderTotalCents - (order.storeCreditUsedCents || 0);

    if (maxRefundAmount <= 0) {
      return NextResponse.json(
        { error: "No refundable amount (order was paid entirely with store credit)" },
        { status: 400 }
      );
    }

    // Use provided amount for partial refund, or default to full refund
    const refundAmount = amount && amount > 0 && amount <= maxRefundAmount 
      ? amount 
      : maxRefundAmount;

    if (refundAmount <= 0 || refundAmount > maxRefundAmount) {
      return NextResponse.json(
        { error: `Invalid refund amount. Maximum refundable: $${(maxRefundAmount / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    // If CREDIT refund, issue store credit immediately (no Stripe balance required)
    if (type === "CREDIT") {
      if (!order.userId) {
        return NextResponse.json(
          { error: "Cannot issue credit refund: Order has no associated user" },
          { status: 400 }
        );
      }

      try {
        await issueStoreCredit({
          userId: order.userId,
          sellerId: order.sellerId,
          amount: refundAmount,
          reason: reason || `Refund for Order #${orderId}`,
        });

        // Mark refund as completed immediately for credit refunds
        await prisma.order.update({
          where: { id: orderId },
          data: {
            refundType: type,
            refundStatus: "COMPLETED",
            refundAmount,
            refundReason: reason ?? null,
            refundedAt: new Date(),
          },
        });

        // Send email notification
        if (order.buyerEmail) {
          try {
            await sendRefundStatusEmail({
              to: order.buyerEmail,
              orderId: order.id,
              refundType: "CREDIT",
              refundStatus: "COMPLETED",
              refundAmount,
              reason: reason || null,
            });
          } catch (emailError) {
            console.error("Error sending refund email:", emailError);
            // Don't fail the refund if email fails
          }
        }

        return NextResponse.json({
          ok: true,
          message: "Refund issued as instant store credit. No cash refund required.",
          refundAmount,
          refundType: "CREDIT",
        });
      } catch (error: any) {
        console.error("Error issuing store credit refund:", error);
        return NextResponse.json(
          { error: "Failed to issue store credit refund" },
          { status: 500 }
        );
      }
    }

    // For CASH refunds, mark as REQUESTED (requires admin/seller approval and Stripe processing)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        refundType: type,
        refundStatus: "REQUESTED",
        refundAmount,
        refundReason: reason ?? null,
      },
    });

    // Send email notification to customer
    if (order.buyerEmail) {
      try {
        await sendRefundStatusEmail({
          to: order.buyerEmail,
          orderId: order.id,
          refundType: "CASH",
          refundStatus: "REQUESTED",
          refundAmount,
          reason: reason || null,
        });
      } catch (emailError) {
        console.error("Error sending refund email:", emailError);
      }
    }

    // Send email notification to seller
    try {
      const seller = await prisma.user.findUnique({
        where: { id: order.sellerId },
        select: { email: true },
      });
      if (seller?.email) {
        await sendEmail({
          to: seller.email,
          subject: `New Refund Request - Order #${orderId.slice(0, 8)}`,
          html: `
            <h2>New Refund Request</h2>
            <p>A customer has requested a refund for order #${orderId.slice(0, 8)}.</p>
            <p><strong>Amount:</strong> $${(refundAmount / 100).toFixed(2)}</p>
            <p><strong>Type:</strong> Cash Refund</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://shopcrazymarket.com"}/seller/refunds">Review Refund Request</a></p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Error sending seller notification:", emailError);
    }

    return NextResponse.json({
      ok: true,
      message: "Cash refund requested. Processing may take 3–5 business days.",
      refundAmount,
      refundType: "CASH",
    });
  } catch (error: any) {
    console.error("Error requesting refund:", error);
    return NextResponse.json(
      { error: error.message || "Failed to request refund" },
      { status: 500 }
    );
  }
}

