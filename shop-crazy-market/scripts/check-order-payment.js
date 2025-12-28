/**
 * Script to check payment status for an order
 * Usage: node scripts/check-order-payment.js ORDER_ID_PREFIX
 */

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkOrderPayment(orderIdPrefix) {
  try {
    console.log(`\n🔍 Searching for order with ID containing: ${orderIdPrefix}\n`);

    // Find order by partial ID
    const orders = await prisma.order.findMany({
      where: {
        id: {
          contains: orderIdPrefix,
        },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            sellerId: true,
          },
        },
      },
      take: 10,
    });

    if (orders.length === 0) {
      console.log('❌ No orders found with that ID prefix');
      return;
    }

    if (orders.length > 1) {
      console.log(`⚠️  Found ${orders.length} orders. Showing first one:\n`);
    }

    const order = orders[0];
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 ORDER DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Order ID: ${order.id}`);
    console.log(`Status: ${order.paymentStatus}`);
    console.log(`Total: $${(order.orderTotalCents / 100).toFixed(2)}`);
    console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
    console.log(`Stripe Session ID: ${order.stripeSessionId || 'None'}`);
    console.log(`Stripe Payment Intent: ${order.stripePaymentIntent || 'None'}`);
    console.log(`Listing: ${order.listing.title}`);
    console.log('');

    if (!order.stripeSessionId) {
      console.log('⚠️  No Stripe session ID found. Payment may not have been initiated.');
      return;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💳 STRIPE SESSION DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
        expand: ['payment_intent'],
      });

      console.log(`Session ID: ${session.id}`);
      console.log(`Status: ${session.status}`);
      console.log(`Payment Status: ${session.payment_status}`);
      console.log(`Amount: $${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}`);
      console.log(`Mode: ${session.livemode ? 'LIVE' : 'TEST'}`);
      console.log(`Customer Email: ${session.customer_email || 'None'}`);
      console.log(`Created: ${new Date(session.created * 1000).toLocaleString()}`);

      const paymentIntentId = typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id;

      if (paymentIntentId) {
        console.log(`Payment Intent ID: ${paymentIntentId}`);
        console.log('');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💰 PAYMENT INTENT DETAILS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

          console.log(`Payment Intent ID: ${paymentIntent.id}`);
          console.log(`Status: ${paymentIntent.status}`);
          console.log(`Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
          console.log(`Created: ${new Date(paymentIntent.created * 1000).toLocaleString()}`);

          if (paymentIntent.charges?.data?.length > 0) {
            const charge = paymentIntent.charges.data[0];
            console.log('');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💵 CHARGE DETAILS');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Charge ID: ${charge.id}`);
            console.log(`Status: ${charge.status}`);
            console.log(`Paid: ${charge.paid ? '✅ YES' : '❌ NO'}`);
            console.log(`Amount: $${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}`);
            console.log(`Created: ${new Date(charge.created * 1000).toLocaleString()}`);
            if (charge.receipt_url) {
              console.log(`Receipt: ${charge.receipt_url}`);
            }

            if (charge.paid) {
              console.log('');
              console.log('✅ PAYMENT WAS SUCCESSFULLY CAPTURED IN STRIPE!');
              console.log('');
              console.log(`🔗 View in Stripe Dashboard:`);
              if (session.livemode) {
                console.log(`   https://dashboard.stripe.com/payments/${charge.id}`);
              } else {
                console.log(`   https://dashboard.stripe.com/test/payments/${charge.id}`);
              }
            } else {
              console.log('');
              console.log('⚠️  Payment intent exists but charge was not paid');
            }
          } else {
            console.log('');
            console.log('⚠️  No charges found for this payment intent');
          }
        } catch (piError) {
          console.log(`❌ Error retrieving payment intent: ${piError.message}`);
        }
      } else {
        console.log('');
        console.log('⚠️  No payment intent found in session');
      }

      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 SUMMARY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const paymentInStripe = session.payment_status === 'paid';
      const orderMarkedPaid = order.paymentStatus === 'paid';
      
      if (paymentInStripe && orderMarkedPaid) {
        console.log('✅ Order status matches Stripe payment status');
      } else if (paymentInStripe && !orderMarkedPaid) {
        console.log('⚠️  Payment is in Stripe but order is not marked as paid');
        console.log('   → Webhook may not have fired. Check webhook logs.');
      } else if (!paymentInStripe && orderMarkedPaid) {
        console.log('⚠️  Order is marked as paid but payment not found in Stripe');
        console.log('   → This is a data inconsistency. Check webhook processing.');
      } else {
        console.log('⏳ Payment is still pending');
      }

      console.log('');
      console.log(`Mode: ${session.livemode ? '🔴 LIVE' : '🟡 TEST'}`);
      console.log(`   → Check ${session.livemode ? 'LIVE' : 'TEST'} mode dashboard:`);
      if (session.livemode) {
        console.log(`   https://dashboard.stripe.com/payments`);
      } else {
        console.log(`   https://dashboard.stripe.com/test/payments`);
      }

    } catch (sessionError) {
      console.log(`❌ Error retrieving Stripe session: ${sessionError.message}`);
      if (sessionError.code === 'resource_missing') {
        console.log('   → Session not found in Stripe. It may have been deleted or is in a different account.');
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const orderIdPrefix = process.argv[2];
if (!orderIdPrefix) {
  console.log('Usage: node scripts/check-order-payment.js ORDER_ID_PREFIX');
  console.log('Example: node scripts/check-order-payment.js 5b125a0a');
  process.exit(1);
}

checkOrderPayment(orderIdPrefix);

