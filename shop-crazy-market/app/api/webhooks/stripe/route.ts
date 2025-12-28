import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if this is a listing fee subscription
        if (session.mode === "subscription" && session.metadata?.listingId) {
          await handleListingFeePayment(session);
        } 
        // Check if this is a marketplace order (has type: "order" in metadata)
        else if (session.metadata?.type === "order") {
          const orderId = session.metadata.orderId as string;
          const paymentIntent = session.payment_intent as string;
          
          console.log("[WEBHOOK] Processing order payment:", { orderId, paymentIntent });
          
          // Update order status
          const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
              stripePaymentIntent: paymentIntent ?? null,
              paymentStatus: "paid",
            },
            include: {
              listing: {
                select: {
                  id: true,
                  title: true,
                  digitalFiles: true,
                },
              },
            },
          });
          
          console.log("[WEBHOOK] Order updated to paid:", orderId);

          // Send order confirmation email
          try {
            const { sendOrderConfirmationEmail } = await import("@/lib/email");
            const emailResult = await sendOrderConfirmationEmail({
              id: updatedOrder.id,
              orderTotalCents: updatedOrder.orderTotalCents,
              currency: updatedOrder.currency,
              createdAt: updatedOrder.createdAt,
              buyerEmail: updatedOrder.buyerEmail,
              listing: updatedOrder.listing,
            });
            if (emailResult.success) {
              console.log("[WEBHOOK] Order confirmation email sent to:", updatedOrder.buyerEmail);
            } else {
              console.error("[WEBHOOK] Failed to send order confirmation email:", emailResult.error);
            }
          } catch (emailError: any) {
            console.error("[WEBHOOK] Error sending order confirmation email:", emailError);
            // Don't fail the webhook if email fails
          }
        } 
        else {
          // Legacy product purchase
          await handleCheckoutSessionCompleted(session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDispute(dispute);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Get line items from session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    if (!session.metadata?.userId) {
      console.error("No userId in session metadata");
      return;
    }

    const userId = session.metadata.userId;
    const totalCents = session.amount_total || 0;
    const paymentIntentId = session.payment_intent as string;

    // Extract fee breakdown from session metadata
    const itemsSubtotalCents = parseInt(session.metadata.itemTotal || "0");
    const shippingCents = parseInt(session.metadata.shippingTotal || "0");
    const giftWrapCents = parseInt(session.metadata.giftWrapTotal || "0");
    const taxCents = parseInt(session.metadata.taxCents || "0");
    const orderSubtotalCents = itemsSubtotalCents + shippingCents + giftWrapCents;
    const orderTotalCents = orderSubtotalCents + taxCents;

    const platformFeeCents = parseInt(session.metadata.transactionFee || session.metadata.platformFeeCents || "0");
    const processingFeeCents = parseInt(session.metadata.paymentProcessingFee || session.metadata.processingFeeCents || "0");
    const adFeeCents = parseInt(session.metadata.advertisingFee || session.metadata.adFeeCents || "0");
    const feesTotalCents = platformFeeCents + processingFeeCents + adFeeCents;
    const sellerPayoutCents = parseInt(session.metadata.sellerPayout || session.metadata.sellerPayoutCents || "0");

    // Check if this is a marketplace order (has listingId) or legacy shop order
    const listingId = session.metadata.listingId;
    const sellerId = session.metadata.sellerId;

    // Create order in database
    const orderData: any = {
      userId: userId || null,
      buyerEmail: session.customer_email || null,
      paymentStatus: "paid",
      orderTotalCents: orderTotalCents || totalCents,
      stripeSessionId: session.id,
      stripePaymentIntent: paymentIntentId,
      itemsSubtotalCents,
      shippingCents,
      giftWrapCents,
      taxCents,
      orderSubtotalCents,
      platformFeeCents,
      processingFeeCents,
      adFeeCents,
      feesTotalCents,
      sellerPayoutCents,
      processingRule: session.metadata.processingRule || null,
      adsEnabledAtSale: session.metadata.hasAdvertising === "true" || session.metadata.adsEnabledAtSale === "true",
    };

    // Add marketplace order fields if this is a listing order
    if (listingId && sellerId) {
      orderData.listingId = listingId;
      orderData.sellerId = sellerId;
      orderData.currency = session.metadata.currency || "usd";
    }

    // Only create items for legacy shop orders (not marketplace orders)
    if (!listingId && lineItems.data.length > 0) {
      orderData.items = {
        create: await Promise.all(
          lineItems.data.map(async (item) => {
            // Try to get product ID from metadata or find by name
            const productName = item.description || (item.price?.product as any)?.name || "";
            const productIdFromMetadata = (item.price?.product as any)?.metadata?.productId;
            
            let dbProduct;
            
            if (productIdFromMetadata) {
              dbProduct = await prisma.product.findUnique({
                where: { id: productIdFromMetadata },
              });
            }
            
            if (!dbProduct && productName) {
              dbProduct = await prisma.product.findFirst({
                where: {
                  title: {
                    contains: productName,
                  },
                },
              });
            }

            if (!dbProduct) {
              console.error(`Product not found: ${productName}`);
              throw new Error(`Product not found: ${productName}`);
            }

            return {
              productId: dbProduct.id,
              quantity: item.quantity || 1,
              price: item.price?.unit_amount || 0,
            };
          })
        ),
      };
    }

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        listing: {
          include: {
            seller: {
              include: {
                shop: true,
              },
            },
          },
        },
      },
    });

    console.log("Order created:", order.id, "Payment Intent:", paymentIntentId);

    // Create fee transaction records (only for legacy shop orders with items)
    if (order.items && order.items.length > 0) {
      const shopIds = new Set(order.items.map((item) => item.product.shopId));
      
      for (const shopId of Array.from(shopIds)) {
        const shopItems = order.items.filter((item) => item.product.shopId === shopId);
        const shopItemTotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shopPercentage = orderSubtotalCents > 0 ? shopItemTotal / orderSubtotalCents : 0;

        await Promise.all([
          prisma.feeTransaction.create({
            data: {
              orderId: order.id,
              shopId,
              type: "transaction",
              amount: Math.round(platformFeeCents * shopPercentage),
              description: `Transaction fee for order ${order.id}`,
            },
          }),
          prisma.feeTransaction.create({
            data: {
              orderId: order.id,
              shopId,
              type: "payment_processing",
              amount: Math.round(processingFeeCents * shopPercentage),
              description: `Payment processing fee for order ${order.id}`,
            },
          }),
          ...(adFeeCents > 0
            ? [
                prisma.feeTransaction.create({
                  data: {
                    orderId: order.id,
                    shopId,
                    type: "advertising",
                    amount: Math.round(adFeeCents * shopPercentage),
                    description: `Advertising fee for order ${order.id}`,
                  },
                }),
              ]
            : []),
        ]);
      }
    }

    // Trigger seller payout after order is created
    try {
      // Group items by shop to calculate payouts
      const shopPayouts = new Map<string, number>();
      
      for (const item of order.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { shop: true },
        });

        if (product?.shop) {
          const shopId = product.shop.id;
          const itemTotal = item.price * item.quantity;
          
          // Calculate seller payout (item total - fees)
          const transactionFee = Math.round(itemTotal * 0.05); // 5%
          const paymentProcessingFee = Math.round(itemTotal * 0.02 + 20); // 2% + $0.20
          const advertisingFee = product.shop.hasAdvertising
            ? Math.round(itemTotal * 0.15)
            : 0;
          
          const sellerPayout = itemTotal - transactionFee - paymentProcessingFee - advertisingFee;
          
          const currentPayout = shopPayouts.get(shopId) || 0;
          shopPayouts.set(shopId, currentPayout + sellerPayout);
        }
      }

      // Create transfers for each shop
      for (const [shopId, payoutAmount] of shopPayouts.entries()) {
        const shop = await prisma.shop.findUnique({
          where: { id: shopId },
        });

        if (shop?.stripeAccountId && payoutAmount > 0) {
          // Call transfer API (this will be handled by the transfer endpoint)
          // For now, we'll just log it - you can implement async job queue here
          console.log(`Payout scheduled: $${(payoutAmount / 100).toFixed(2)} to shop ${shopId}`);
          
          // In production, you might want to use a job queue like Bull or similar
          // to handle payouts asynchronously
        }
      }
    } catch (error) {
      console.error("Error scheduling payouts:", error);
      // Don't fail the webhook if payout scheduling fails
    }
  } catch (error: any) {
    console.error("Error handling checkout session:", error);
    throw error;
  }
}

async function handleRefund(charge: Stripe.Charge) {
  // Find order by payment intent
  const paymentIntentId = charge.payment_intent as string;
  
  // Update order payment status to refunded
  await prisma.order.updateMany({
    where: { stripePaymentIntent: paymentIntentId },
    data: { paymentStatus: "refunded" },
  });
  
  console.log("Refund processed for charge:", charge.id);
}

async function handleDispute(dispute: Stripe.Dispute) {
  // Log dispute for admin review
  console.log("Dispute created:", dispute.id);
  // You can create a dispute record in your database here
}

async function handleListingFeePayment(session: Stripe.Checkout.Session) {
  try {
    const listingId = session.metadata?.listingId;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    
    if (!listingId) {
      console.error("No listingId in session metadata");
      return;
    }

    // Update listing to store subscription details and activate it
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        feeSubscriptionId: subscriptionId || null,
        feeCustomerId: customerId || null,
        feeSubscriptionStatus: "active",
        isActive: true,
      },
    });

    console.log(`Listing ${listingId} fee paid and activated`, {
      subscriptionId,
      customerId,
    });
  } catch (error: any) {
    console.error("Error handling listing fee payment:", error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  try {
    // Get the listing ID from subscription metadata
    const listingId = subscription.metadata?.listingId;
    
    if (!listingId) {
      return; // Not a listing fee subscription
    }

    // Update listing based on subscription status
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        isActive,
        feeSubscriptionStatus: subscription.status,
      },
    });

    console.log(`Listing ${listingId} subscription updated: ${subscription.status}`);
  } catch (error: any) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Get subscription from invoice
    const subscriptionId = invoice.subscription as string;
    
    if (!subscriptionId) {
      return; // Not a subscription invoice
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const listingId = subscription.metadata?.listingId;
    
    if (!listingId) {
      return; // Not a listing fee subscription
    }

    // Ensure listing is active after successful payment
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        isActive: true,
        feeSubscriptionStatus: "active",
      },
    });

    console.log(`Listing ${listingId} monthly fee paid successfully`);
  } catch (error: any) {
    console.error("Error handling invoice payment:", error);
    throw error;
  }
}

