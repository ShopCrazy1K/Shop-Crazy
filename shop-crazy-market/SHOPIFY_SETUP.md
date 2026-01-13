# Shopify Integration Setup Guide

This guide will help you set up the Shopify OAuth integration for your marketplace.

## Prerequisites

1. A Shopify Partner account (free) - Sign up at https://partners.shopify.com
2. A Shopify store (development store is fine for testing)

## Step 1: Create a Shopify App

1. Go to your [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click "Apps" in the sidebar
3. Click "Create app"
4. Choose "Create app manually"
5. Give your app a name (e.g., "Your Marketplace Integration")
6. Set the App URL to: `https://your-domain.com/api/shopify/oauth`
7. Set the Allowed redirection URL(s) to: `https://your-domain.com/api/shopify/oauth/callback`

## Step 2: Configure App Scopes

In your app settings, configure the following scopes:
- `read_products` - Read product information
- `write_products` - Update products
- `read_orders` - Read order information
- `write_orders` - Create/update orders

## Step 3: Get API Credentials

1. In your Shopify app settings, go to "API credentials"
2. Copy your **API key** (Client ID)
3. Copy your **API secret key** (Client Secret)

## Step 4: Set Environment Variables

Add these to your `.env` file:

```bash
# Shopify Integration
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders

# Encryption Key (generate a random 32-byte hex string)
# You can generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_32_byte_hex_string_here

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Step 5: Run Database Migration

After updating the Prisma schema, run:

```bash
npx prisma migrate dev --name add_shopify_integration
```

Or if using `prisma db push`:

```bash
npx prisma db push
```

## Step 6: Test the Integration

1. Go to `/seller/platforms` in your app
2. Click "Connect Platform"
3. Select "Shopify"
4. Enter your Shopify store name (e.g., "my-store" for my-store.myshopify.com)
5. Click "Connect with Shopify"
6. You'll be redirected to Shopify to authorize the connection
7. After authorization, you'll be redirected back and your store will be connected

## How It Works

1. **OAuth Flow**: When a seller clicks "Connect with Shopify", they're redirected to Shopify's OAuth page
2. **Authorization**: Seller authorizes your app to access their store
3. **Token Exchange**: Shopify redirects back with an authorization code
4. **Token Storage**: The access token is encrypted and stored securely
5. **Product Sync**: Sellers can manually sync products or set up automatic syncing

## Product Synchronization

- Products are synced as **Listings** in your marketplace
- The first sync imports all products from Shopify
- Subsequent syncs update existing listings or create new ones
- Products are matched by their Shopify product ID

## Security

- All access tokens are encrypted using AES-256-GCM
- Tokens are never exposed in API responses
- HMAC verification ensures OAuth callbacks are legitimate

## Troubleshooting

### "Invalid HMAC" Error
- Check that your `SHOPIFY_API_SECRET` is correct
- Ensure your callback URL matches exactly what's configured in Shopify

### "Failed to exchange code for token"
- Verify your API credentials are correct
- Check that your app is approved (if in review)
- Ensure the authorization code hasn't expired

### Products Not Syncing
- Check that the access token is valid
- Verify the store name is correct
- Check API rate limits (Shopify allows 2 requests per second)

## Support

For more information, see:
- [Shopify OAuth Documentation](https://shopify.dev/docs/apps/auth/oauth)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-rest)
