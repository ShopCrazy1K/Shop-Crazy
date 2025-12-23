# Fix "Tenant or user not found" Error

## ✅ Good News!

The error changed from "Can't reach database server" to "Tenant or user not found"!

This means:
- ✅ Connection pooling URL is working
- ✅ It's connecting to the database
- ❌ But authentication is failing

---

## 🔍 The Problem

The username format in the pooling URL might be wrong, or you need to use a different connection string format.

---

## ✅ Solution: Get Exact URL from Supabase

The pooling URL format can vary. Get the **exact** one from your Supabase dashboard:

### Step 1: Get Pooling URL from Supabase

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database

2. **Scroll to "Connection Pooling" section**

3. **Find "Connection string" (URI format)**

4. **Copy that EXACT URL**

### Step 2: Verify Password Encoding

The password in the URL should have `%23` (not `#`).

If the Supabase URL has `#`, replace it with `%23`.

### Step 3: Update in Vercel

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Delete** the current value
4. **Paste** the exact URL from Supabase (with `%23` for password)
5. Click "Save"
6. **Redeploy**

---

## 🔧 Alternative: Try Different Username Format

If the Supabase dashboard doesn't show a pooling URL, try these formats:

### Option 1: With Project Ref in Username
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 2: Just Postgres Username
```
postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 3: Transaction Mode (Different Port)
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

---

## 📋 What to Check in Supabase

1. **Connection Pooling Status:**
   - Is it enabled?
   - What mode? (Session, Transaction, or Statement)

2. **Connection String Format:**
   - URI format vs JDBC format
   - Make sure you're using URI format

3. **Password:**
   - Verify the password is correct
   - Make sure it's URL-encoded (`%23` for `#`)

---

## 🎯 Most Likely Fix

**Get the exact pooling URL from Supabase dashboard** - don't construct it manually. The format can vary based on:
- Your Supabase plan
- Your region
- Pooling mode settings

---

## ✅ Steps to Fix

1. **Go to Supabase Dashboard:**
   - Settings → Database → Connection Pooling

2. **Copy the "Connection string" (URI format)**

3. **If password has `#`, replace with `%23`**

4. **Update DATABASE_URL in Vercel**

5. **Save and Redeploy**

6. **Test again**

---

## 🆘 If Still Not Working

1. **Check Supabase Dashboard:**
   - Is connection pooling enabled?
   - What's the exact connection string shown?

2. **Try Direct Connection (Temporary):**
   - For testing, you could try the direct connection
   - But this won't work long-term with Vercel
   - Only use to verify password is correct

3. **Verify Password:**
   - Make sure `Icemanbaby1991#` is correct
   - In URL it should be `Icemanbaby1991%23`

---

## 📞 What to Share

If you're still having issues, please share:
1. The exact connection string from Supabase dashboard (you can mask the password)
2. Whether connection pooling is enabled
3. What pooling mode is selected

