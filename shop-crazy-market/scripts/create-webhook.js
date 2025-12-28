/**
 * Script to create Stripe webhook endpoint via API
 * Run this with: node scripts/create-webhook.js
 * 
 * Make sure STRIPE_SECRET_KEY is set in your environment
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createWebhook() {
  try {
    const webhookUrl = process.env.WEBHOOK_URL || 'https://shopcrazymarket.com/api/webhooks/stripe';
    
    console.log('Creating webhook endpoint...');
    console.log('URL:', webhookUrl);
    
    const endpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ],
      description: 'Shop Crazy Market - Order payments and listing subscriptions',
    });

    console.log('\n✅ Webhook created successfully!');
    console.log('\nWebhook Details:');
    console.log('ID:', endpoint.id);
    console.log('URL:', endpoint.url);
    console.log('Status:', endpoint.status);
    console.log('\n⚠️  IMPORTANT: Copy this signing secret and add it to Vercel:');
    console.log('Signing Secret:', endpoint.secret);
    console.log('\nAdd to Vercel Environment Variables:');
    console.log('Name: STRIPE_WEBHOOK_SECRET');
    console.log('Value:', endpoint.secret);
    console.log('\nThen redeploy your application.');
    
  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\nMake sure STRIPE_SECRET_KEY is set correctly.');
    }
    process.exit(1);
  }
}

createWebhook();

