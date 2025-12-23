# Fix "Can't reach database server" on Vercel

## 🔍 The Problem

**Error changed from "Tenant or user not found" to "Can't reach database server"**

This means:
- ✅ Password is correct (no more auth error)
- ❌ Vercel can't reach the database (direct connection blocked)

**Why:** Supabase blocks direct connections (port 5432) from serverless environments like Vercel. You MUST use connection pooling (port 6543).

---

## ✅ THE FIX: Enable Connection Pooling

### Step 1: Enable Connection Pooling in Supabase

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database

2. **Scroll to "Connection Pooling" section**

3. **Check if it's enabled:**
   - If you see "Connection Pooling" but it's not enabled, enable it
   - If you don't see this section, you might need to upgrade your Supabase plan

4. **Choose pooling mode:**
   - **Transaction mode** (recommended for serverless/Vercel)
   - Or **Session mode**

### Step 2: Get Exact Pooling Connection String

1. **In the "Connection Pooling" section:**
   - Find "Connection string" (URI format)
   - **Copy that EXACT string**

2. **It should look like:**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

3. **Fix password encoding:**
   - If password has `$`, replace with `%24`
   - Example: `Puggyboy1$$$` → `Puggyboy1%24%24%24`

### Step 3: Update Vercel

1. **Go to:** Vercel → Settings → Environment Variables
2. **Click on `DATABASE_URL`**
3. **Delete current value**
4. **Paste the exact pooling URL from Supabase** (with `%24` for `$`)
5. **Click "Save"**
6. **Redeploy**

---

## 🆘 If Connection Pooling is Not Available

**If you don't see connection pooling in Supabase:**

### Option 1: Upgrade Supabase Plan

- Connection pooling is available on paid plans
- Free tier might not have it
- Check your Supabase plan

### Option 2: Use Supabase Connection String with Pooling

**Try this format (if pooling is enabled but URL format is different):**

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Or with simple username:**
```
postgresql://postgres:Puggyboy1%24%24%24@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 3: Check Your Region

**Your region might not be `us-east-1`:**

1. **Check your Supabase region:**
   - Go to project settings
   - Look for "Region" or "Location"

2. **Common regions:**
   - `us-east-1` (US East)
   - `us-west-1` (US West)  
   - `eu-west-1` (Europe)
   - `ap-southeast-1` (Asia)

3. **Update connection string:**
   - Replace `us-east-1` with your actual region
   - Example for `us-west-1`:
     ```
     postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy1%24%24%24@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```

---

## 🔧 Alternative: Use Supabase Client Instead

**If connection pooling is not available, you could:**

1. Use Supabase client for database operations
2. Keep Prisma for local development
3. Or use Supabase REST API

But let's try to get pooling working first!

---

## 📋 Complete Checklist

- [ ] Check if connection pooling is enabled in Supabase
- [ ] Get exact pooling connection string from Supabase
- [ ] Fix password encoding (`$` → `%24`)
- [ ] Verify region is correct
- [ ] Update DATABASE_URL in Vercel
- [ ] Save in Vercel
- [ ] Redeploy
- [ ] Test `/api/test-db`
- [ ] Try sign up

---

## 🎯 Key Points

1. **Direct connection (5432) won't work from Vercel** - Supabase blocks it
2. **You MUST use connection pooling (6543)** - Required for serverless
3. **Get the exact URL from Supabase** - Don't construct it manually
4. **Password encoding is critical** - `$` must be `%24`

---

## 💡 What to Check in Supabase

1. **Is connection pooling enabled?**
   - Settings → Database → Connection Pooling
   - Should show "Enabled" or connection strings

2. **What's your region?**
   - Project settings → Region
   - Use this in the pooling URL

3. **What connection string does it show?**
   - Copy the exact URI format
   - Don't modify it (except password encoding)

---

## ✅ Expected Working URL Format

Once pooling is enabled, your URL should:
- Use port `6543` (not `5432`)
- Have host `pooler.supabase.com` (not `db.hbufjpxdzmygjnbfsniu.supabase.co`)
- End with `?pgbouncer=true`
- Have password encoded: `Puggyboy1%24%24%24`

---

## 🆘 If Still Not Working

Please share:
1. **Is connection pooling enabled in Supabase?** (Yes/No)
2. **What connection string does Supabase show?** (mask password)
3. **What's your Supabase region?**
4. **What's your Supabase plan?** (Free/Pro/etc.)

This will help identify the exact issue!

