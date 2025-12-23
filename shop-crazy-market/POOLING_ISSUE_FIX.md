# Fix "Tenant or user not found" with Pooling

## 🔍 The Problem

You're getting "Tenant or user not found" even with the correct password.

**This usually means:**
- Connection pooling is not enabled in Supabase
- Or the pooling URL format is wrong
- Or your region is different

---

## ✅ Solution 1: Use Direct Connection (Temporary)

**Since direct connection works, use it for now:**

```
postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Steps:**
1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Delete current value
4. Paste the string above
5. Click "Save"
6. Redeploy

**Note:** This works but may have connection limits with Vercel. We'll fix pooling next.

---

## ✅ Solution 2: Enable Connection Pooling in Supabase

**If pooling isn't working, enable it:**

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database

2. **Scroll to "Connection Pooling" section**

3. **Check if it's enabled:**
   - If not enabled, enable it
   - Choose mode: "Transaction" (recommended for serverless)

4. **Get the exact connection string:**
   - Copy the "Connection string" (URI format)
   - It should look like:
     ```
     postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```

5. **Fix password encoding:**
   - Replace `$` with `%24` in password
   - Example: `Puggyboy1$$$` → `Puggyboy1%24%24%24`

6. **Use in Vercel:**
   - Update DATABASE_URL with the exact string from Supabase
   - Save and redeploy

---

## ✅ Solution 3: Check Your Region

**Your Supabase region might not be `us-east-1`:**

1. **Check your region:**
   - Go to Supabase Dashboard
   - Check project settings
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

## 🎯 Recommended Approach

### Step 1: Use Direct Connection Now

**Get sign up working first:**

1. Use direct connection URL:
   ```
   postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```

2. Update in Vercel
3. Redeploy
4. Test sign up - should work!

### Step 2: Fix Pooling Later

**Once sign up works, fix pooling:**

1. Enable connection pooling in Supabase
2. Get exact connection string from dashboard
3. Update Vercel with pooling URL
4. Redeploy

---

## 📋 Quick Fix (Copy This Now)

**Use direct connection to get it working:**

```
postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Steps:**
1. Vercel → Settings → Environment Variables → DATABASE_URL
2. Delete current value
3. Paste above
4. Save
5. Redeploy
6. Test sign up

---

## 🆘 If Direct Connection Also Fails

**Check:**
1. Is database running? (not paused)
2. Is password correct? (`Puggyboy1$$$`)
3. Is project ref correct? (`hbufjpxdzmygjnbfsniu`)

**Get exact connection string from Supabase:**
- Dashboard → Settings → Database → Connection string
- Copy the URI format
- Fix password encoding (`$` → `%24`)
- Use in Vercel

---

## ✅ Success Checklist

- [ ] Updated DATABASE_URL in Vercel with correct password
- [ ] Used direct connection (works for now)
- [ ] Saved in Vercel
- [ ] Redeployed
- [ ] Tested `/api/test-db` - shows success
- [ ] Sign up works!

---

## 💡 Why Direct Connection Works

- Direct connection (port 5432) works because it's the standard PostgreSQL connection
- Pooling (port 6543) requires specific Supabase configuration
- For now, use direct connection to get sign up working
- We can optimize with pooling later

