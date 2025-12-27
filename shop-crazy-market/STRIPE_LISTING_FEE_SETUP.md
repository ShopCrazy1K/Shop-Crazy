# 🔧 Setup: Stripe Listing Fee Price

## Error
```
Missing STRIPE_LISTING_FEE_PRICE_ID in env
```

## ✅ Solution

You need to create a Stripe Price for the listing fee ($0.20/month) and add the Price ID to Vercel.

## 🚀 Option 1: Create via Script (Recommended)

### Step 1: Run the script

```bash
cd /Users/ronhart/social-app/shop-crazy-market
npx tsx scripts/create-listing-fee-price.ts
```

**Note:** Make sure `STRIPE_SECRET_KEY` is set in your `.env` file first.

The script will:
1. Create a Stripe Product called "Listing Fee"
2. Create a recurring Price for $0.20/month
3. Display the Price ID you need to add to Vercel

### Step 2: Add to Vercel

1. Copy the Price ID from the script output (starts with `price_...`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add:
   - **Key:** `STRIPE_LISTING_FEE_PRICE_ID`
   - **Value:** The Price ID (e.g., `price_1Sgqx8Cmvd4jlAX7...`)
   - **Environment:** All (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Redeploy

After adding the variable, redeploy your latest deployment.

## 🚀 Option 2: Create Manually in Stripe Dashboard

### Step 1: Create Product

1. Go to: https://dashboard.stripe.com/products
2. Click **"Add product"**
3. Fill in:
   - **Name:** `Listing Fee`
   - **Description:** `Monthly listing fee for Shop Crazy Market`
4. Click **"Save product"**

### Step 2: Create Price

1. In the product page, click **"Add price"**
2. Fill in:
   - **Price:** `$0.20`
   - **Billing period:** `Monthly` (recurring)
   - **Currency:** `USD`
3. Click **"Add price"**

### Step 3: Get Price ID

1. After creating the price, you'll see the Price ID
2. It starts with `price_...` (e.g., `price_1Sgqx8Cmvd4jlAX7...`)
3. Copy this ID

### Step 4: Add to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Key:** `STRIPE_LISTING_FEE_PRICE_ID`
   - **Value:** The Price ID you copied
   - **Environment:** All (Production, Preview, Development)
3. Click **"Save"**

### Step 5: Redeploy

After adding the variable, redeploy your latest deployment.

## ✅ Verify

After setting up, when users create a listing:
1. They'll be redirected to Stripe Checkout
2. They'll pay $0.20/month for the listing
3. The listing will be activated after payment

## 📝 Price Details

- **Amount:** $0.20 USD
- **Interval:** Monthly (recurring subscription)
- **Product:** "Listing Fee"

## 🆘 Troubleshooting

### Script fails with "API key" error
- Make sure `STRIPE_SECRET_KEY` is in your `.env` file
- Use your live key: `sk_live_...`

### Price ID not working
- Verify the Price ID starts with `price_`
- Make sure it's a recurring monthly price
- Check it's in the same Stripe account as your secret key

### Still getting error after setup
- Verify the environment variable is set in Vercel
- Redeploy after adding the variable
- Check Vercel logs for any errors

