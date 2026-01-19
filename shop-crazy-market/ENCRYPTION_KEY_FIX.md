# Fix "Failed to encrypt data" Error

## Problem
The error "Failed to encrypt data" occurs because the `ENCRYPTION_KEY` environment variable is missing or invalid in Vercel.

## Solution: Set ENCRYPTION_KEY in Vercel

### Step 1: Generate an Encryption Key

Run this command to generate a secure 32-byte (64 hex character) encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a string like:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Copy this key** - you'll need it in the next step.

### Step 2: Add ENCRYPTION_KEY to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **shop-crazy-market**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add this variable:
   - **Key**: `ENCRYPTION_KEY`
   - **Value**: Paste the key you generated in Step 1 (should be 64 hex characters)
   - **Environment**: Check all three: Production, Preview, Development
6. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Wait 2-3 minutes for deployment to complete

### Step 4: Test Again

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. Click "Connect Platform" → "Shopify"
3. Enter your store name
4. Click "Connect with Shopify"

## Important Notes

- **ENCRYPTION_KEY must be exactly 64 hex characters** (32 bytes)
- **Don't share this key** - keep it secret
- **Don't change the key** after connections are created - you won't be able to decrypt existing tokens
- **Use the same key** in all environments (Production, Preview, Development)

## Why This Is Needed

The `ENCRYPTION_KEY` is used to encrypt Shopify access tokens before storing them in the database. Without this key, the app cannot securely store OAuth tokens.

## Verify It's Set

After adding the key and redeploying, check the error message:
- If you see a specific error about `ENCRYPTION_KEY` being missing or invalid, you'll know exactly what to fix
- The improved error handling will tell you if the key format is wrong
