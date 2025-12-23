# Verify DATABASE_URL is Correct

## ❌ Current Error

The error shows:
```
Can't reach database server at `db.hbufjpxdzmygjnbfsniu.supabase.co:5432`
```

This means you're **still using the direct connection URL** (port 5432).

---

## ✅ What You Need

You need the **connection pooling URL** (port 6543).

---

## 🔍 Check Your Current DATABASE_URL

### Step 1: View in Vercel

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Look at the Value field**

### Step 2: What to Look For

**❌ WRONG (Direct Connection - Port 5432):**
```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**✅ CORRECT (Connection Pooling - Port 6543):**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🔧 Key Differences

| Feature | Direct (WRONG) | Pooling (CORRECT) |
|---------|----------------|-------------------|
| **Username** | `postgres` | `postgres.hbufjpxdzmygjnbfsniu` |
| **Host** | `db.hbufjpxdzmygjnbfsniu.supabase.co` | `aws-0-us-east-1.pooler.supabase.com` |
| **Port** | `5432` | `6543` |
| **Query** | (none) | `?pgbouncer=true` |

---

## ✅ Fix Steps

### Option 1: Use This URL (Most Likely)

If your Supabase region is `us-east-1`, use this:

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Steps:**
1. Go to Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Delete** the current value
4. **Paste** the URL above
5. Click "Save"
6. **Redeploy**

### Option 2: Get Exact URL from Supabase

If the URL above doesn't work, get the exact one:

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database

2. **Scroll to "Connection Pooling" section**

3. **Find "Connection string" (URI format)**

4. **Copy that URL**

5. **Make sure password has `%23` (not `#`)**

6. **Update in Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Click on `DATABASE_URL`
   - Replace with the pooling URL
   - Click "Save"
   - Redeploy

---

## 🎯 Quick Checklist

- [ ] DATABASE_URL uses port **6543** (not 5432)
- [ ] Host is **pooler.supabase.com** (not db.hbufjpxdzmygjnbfsniu.supabase.co)
- [ ] Username is **postgres.hbufjpxdzmygjnbfsniu** (not just postgres)
- [ ] URL ends with **?pgbouncer=true**
- [ ] Password has **%23** (not #)
- [ ] Clicked "Save" in Vercel
- [ ] Redeployed after updating

---

## 🆘 If Still Not Working

1. **Verify in Vercel:**
   - Check the exact value of DATABASE_URL
   - Make sure it's the pooling URL (port 6543)

2. **Check Supabase:**
   - Make sure connection pooling is enabled
   - Check your region (might not be us-east-1)

3. **Get Exact URL:**
   - Go to Supabase dashboard
   - Copy the exact pooling URL
   - Use that in Vercel

---

## ✅ After Fixing

1. **Save** the updated DATABASE_URL in Vercel
2. **Redeploy** your project
3. **Test** sign up/login
4. **Check logs** - should see successful connections

---

## 📋 Most Common Issue

**You updated the URL but didn't redeploy!**

After updating DATABASE_URL in Vercel:
- ✅ Click "Save"
- ✅ **Redeploy** (very important!)
- ✅ Wait for deployment to complete
- ✅ Test again

The old deployment is still using the old DATABASE_URL until you redeploy!

