import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
        await handleCheckoutSessionCompleted(session);
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
    const total = session.amount_total || 0;
    const paymentIntentId = session.payment_intent as string;

    // Extract fee breakdown from session metadata
    const feeMetadata = {
      itemTotal: session.metadata.itemTotal || "0",
      shippingTotal: session.metadata.shippingTotal || "0",
      giftWrapTotal: session.metadata.giftWrapTotal || "0",
      transactionFee: session.metadata.transactionFee || "0",
      paymentProcessingFee: session.metadata.paymentProcessingFee || "0",
      advertisingFee: session.metadata.advertisingFee || "0",
      sellerPayout: session.metadata.sellerPayout || "0",
      country: session.metadata.country || "US",
      hasAdvertising: session.metadata.hasAdvertising === "true",
    };

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId,
        status: "PAID",
        total,
        paymentIntentId,
        stripeSessionId: session.id,
        metadata: feeMetadata as any,
        transactionFee: parseInt(feeMetadata.transactionFee),
        paymentProcessingFee: parseInt(feeMetadata.paymentProcessingFee),
        advertisingFee: parseInt(feeMetadata.advertisingFee),
        sellerPayout: parseInt(feeMetadata.sellerPayout),
        items: {
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
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log("Order created:", order.id, "Payment Intent:", paymentIntentId);

    // Create fee transaction records for each shop in the order
    const shopIds = new Set(order.items.map((item) => item.product.shopId));
    
    for (const shopId of Array.from(shopIds)) {
      const shopItems = order.items.filter((item) => item.product.shopId === shopId);
      const shopItemTotal = shopItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderSubtotal = parseInt(feeMetadata.itemTotal) + parseInt(feeMetadata.shippingTotal) + parseInt(feeMetadata.giftWrapTotal);
      const shopPercentage = orderSubtotal > 0 ? shopItemTotal / orderSubtotal : 0;

      await Promise.all([
        prisma.feeTransaction.create({
          data: {
            orderId: order.id,
            shopId,
            type: "transaction",
            amount: Math.round(parseInt(feeMetadata.transactionFee) * shopPercentage),
            description: `Transaction fee for order ${order.id}`,
          },
        }),
        prisma.feeTransaction.create({
          data: {
            orderId: order.id,
            shopId,
            type: "payment_processing",
            amount: Math.round(parseInt(feeMetadata.paymentProcessingFee) * shopPercentage),
            description: `Payment processing fee for order ${order.id}`,
          },
        }),
        ...(parseInt(feeMetadata.advertisingFee) > 0
          ? [
              prisma.feeTransaction.create({
                data: {
                  orderId: order.id,
                  shopId,
                  type: "advertising",
                  amount: Math.round(parseInt(feeMetadata.advertisingFee) * shopPercentage),
                  description: `Advertising fee for order ${order.id}`,
                },
              }),
            ]
          : []),
      ]);
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
  
  // Update order status to refunded
  // Note: You may want to add a refunds table or update order status
  console.log("Refund processed for charge:", charge.id);
}

async function handleDispute(dispute: Stripe.Dispute) {
  // Log dispute for admin review
  console.log("Dispute created:", dispute.id);
  // You can create a dispute record in your database here
}

