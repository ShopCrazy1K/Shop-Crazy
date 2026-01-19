# Fix: "Invalid API key or access token" Error

## Problem
The error "Invalid API key or access token (unrecognized login or wrong password)" means the access token can't be decrypted. This happens when:

1. **ENCRYPTION_KEY changed** after the connection was created
2. **Token is corrupted** in the database
3. **Decryption is failing** silently

## Solution: Reconnect to Get New Token

Since the token can't be decrypted, you need to get a fresh token by reconnecting.

### Step 1: Disconnect Shopify

1. Go to: `https://shopcrazymarket.com/seller/platforms`
2. Find your Shopify connection
3. Click **"Disconnect"**
4. Confirm the disconnection

### Step 2: Verify ENCRYPTION_KEY is Set

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check that `ENCRYPTION_KEY` is set
3. It should be a 64-character hex string (e.g., `8cd112c2040cf9dbfe9040e0dba57101159a95c2a6504f6375a9d8e08677e127`)
4. **Don't change it** - if you change it, all existing tokens will become invalid

### Step 3: Reconnect Shopify

1. On `/seller/platforms` page
2. Click **"Connect Platform"**
3. Select **"Shopify"**
4. Enter your Shopify store name
5. Click **"Connect with Shopify"**
6. Authorize the app on Shopify

### Step 4: Test Sync

After reconnecting, the new token will be encrypted with the current `ENCRYPTION_KEY` and should work.

## Why This Happens

- Tokens are encrypted before storing in the database
- If `ENCRYPTION_KEY` changes, old encrypted tokens can't be decrypted
- The decrypt function returns the encrypted token if decryption fails
- Shopify API rejects the encrypted token, causing "Invalid API key" error

## Prevention

⚠️ **Never change ENCRYPTION_KEY after connections are created!**
- If you must change it, you'll need to reconnect all platforms
- Keep the same key across all environments
- Back up your ENCRYPTION_KEY securely

## If Error Persists

If you still get the error after reconnecting:

1. **Check Vercel logs** for decryption errors
2. **Verify ENCRYPTION_KEY** is the same in all environments
3. **Check browser console** (F12) for detailed error messages
4. **Try disconnecting and reconnecting** one more time

The improved error handling will now show a clearer message if decryption fails.
