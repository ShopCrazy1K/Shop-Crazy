# 🚨 How to Set DATABASE_URL in Vercel

## Error: "DATABASE_URL environment variable is not set"

This means the `DATABASE_URL` is not configured in Vercel. Here's how to fix it:

---

## Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on your project: **Shop Crazy Market** (or your project name)

### Step 2: Navigate to Environment Variables

1. Click on **Settings** tab (top navigation)
2. Click on **Environment Variables** (left sidebar)

### Step 3: Add DATABASE_URL

1. Click **Add New** button
2. **Key:** `DATABASE_URL`
3. **Value:** Paste one of these URLs:

#### Option A: Connection Pooling (Recommended for Vercel)
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

#### Option B: Direct Connection
```
postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

4. **Environment:** Select all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Click **Save**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger auto-deploy

---

## ⚠️ Important Notes

### DO:
- ✅ Copy the URL exactly (no quotes)
- ✅ No spaces before or after
- ✅ Password must be encoded (`%24` for `$`)
- ✅ Select all environments (Production, Preview, Development)

### DON'T:
- ❌ Don't add quotes around the URL
- ❌ Don't add spaces
- ❌ Don't use the raw password (must encode `$` as `%24`)
- ❌ Don't forget to select environments

---

## Verify It's Set

### Method 1: Check in Vercel Dashboard

1. Go to: **Settings → Environment Variables**
2. You should see `DATABASE_URL` listed
3. Click on it to verify the value (password will be hidden)

### Method 2: Check After Deploy

After redeploying, visit:
- `https://your-app.vercel.app/api/debug-database-url`
- Should show `success: true` and URL info

---

## If You Already Have DATABASE_URL

If `DATABASE_URL` already exists but you're still getting the error:

1. **Delete the old one:**
   - Click on `DATABASE_URL`
   - Click **Delete**
   - Confirm deletion

2. **Create a new one:**
   - Follow Step 3 above
   - Use the connection pooling URL (Option A)

3. **Redeploy:**
   - Go to Deployments
   - Click Redeploy

---

## Troubleshooting

### Error Still Appears After Setting

1. **Check environment selection:**
   - Make sure you selected all environments
   - Or at least select "Production"

2. **Check for typos:**
   - Verify the URL is exactly as shown
   - No extra characters or spaces

3. **Redeploy:**
   - Environment variables only apply to new deployments
   - You must redeploy after adding/changing variables

### Still Not Working?

1. **Check Vercel logs:**
   - Go to: Deployments → Latest → Functions → View Logs
   - Look for `DATABASE_URL` in the logs

2. **Verify in code:**
   - Visit: `/api/debug-database-url`
   - Should show the URL (password hidden)

3. **Try both URLs:**
   - Try connection pooling first (port 6543)
   - If that fails, try direct connection (port 5432)

---

## Quick Copy-Paste

**For Connection Pooling (Recommended):**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**For Direct Connection:**
```
postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

---

**After setting this, redeploy and the error should be gone!**

