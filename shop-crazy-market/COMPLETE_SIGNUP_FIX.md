# Complete Sign Up Fix Guide

## 🔍 Current Issue

Sign up is failing, likely due to database connection issues.

---

## ✅ Step 1: Test Database Connection

**First, let's verify the database connection works:**

1. **After deploying, visit:**
   ```
   https://your-vercel-app.vercel.app/api/test-db
   ```

2. **Check the response:**
   - ✅ If it shows `"success": true` - connection works, proceed to Step 2
   - ❌ If it shows an error - connection is still broken, fix DATABASE_URL

---

## ✅ Step 2: Verify Database Tables Exist

**If connection works but sign up still fails, tables might not exist:**

### Option A: Run Migrations via Prisma Studio

1. **Locally, run:**
   ```bash
   cd /Users/ronhart/social-app/shop-crazy-market
   npx prisma db push
   ```

2. **Or use Prisma Studio to verify:**
   ```bash
   npx prisma studio
   ```

### Option B: Run Migrations via Supabase SQL Editor

1. **Go to:** Supabase Dashboard → SQL Editor
2. **Check if `User` table exists:**
   ```sql
   SELECT * FROM "User" LIMIT 1;
   ```

3. **If table doesn't exist, create it:**
   - Go to Prisma → Generate SQL
   - Or run `npx prisma migrate dev` locally
   - Copy the SQL and run in Supabase SQL Editor

---

## ✅ Step 3: Fix DATABASE_URL (If Connection Test Fails)

### Get Exact Connection String from Supabase

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database

2. **For Connection Pooling:**
   - Scroll to "Connection Pooling"
   - Copy "Connection string" (URI format)
   - Replace `#` with `%23` in password
   - Use in Vercel

3. **For Direct Connection (Testing):**
   - Scroll to "Connection string"
   - Copy the URI format
   - Replace `#` with `%23` in password
   - Use in Vercel (temporary, for testing)

### Update in Vercel

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Replace with correct URL
4. **Save**
5. **Redeploy**

---

## ✅ Step 4: Verify Sign Up Works

1. **Test the connection:**
   - Visit: `https://your-app.vercel.app/api/test-db`
   - Should show success

2. **Test sign up:**
   - Go to sign up page
   - Try creating an account
   - Check browser console for errors
   - Check Vercel function logs

---

## 🆘 Common Issues & Fixes

### Issue 1: "Tenant or user not found"

**Cause:** Wrong username/password in connection string

**Fix:**
- Verify password in Supabase dashboard
- Make sure `#` is encoded as `%23`
- Try different username formats:
  - `postgres` (simple)
  - `postgres.hbufjpxdzmygjnbfsniu` (with project ref)

### Issue 2: "Can't reach database server"

**Cause:** Wrong host/port or connection pooling not enabled

**Fix:**
- Use connection pooling URL (port 6543)
- Or enable connection pooling in Supabase
- Check if database is paused

### Issue 3: "Table does not exist"

**Cause:** Migrations not run on Supabase database

**Fix:**
- Run `npx prisma db push` locally
- Or run migrations via Supabase SQL Editor
- Verify tables exist with Prisma Studio

### Issue 4: Connection works but sign up fails

**Cause:** Tables exist but schema mismatch

**Fix:**
- Run `npx prisma db push` to sync schema
- Check Prisma schema matches database
- Verify User table has correct columns

---

## 📋 Complete Checklist

- [ ] **Test database connection** (`/api/test-db`)
- [ ] **Verify DATABASE_URL** is correct in Vercel
- [ ] **Check password encoding** (`%23` not `#`)
- [ ] **Verify tables exist** (User table)
- [ ] **Run migrations** if tables don't exist
- [ ] **Redeploy** after any changes
- [ ] **Test sign up** after deployment

---

## 🎯 Quick Test Commands

### Test Connection Locally

```bash
cd /Users/ronhart/social-app/shop-crazy-market
npx prisma db pull  # Pull schema from database
npx prisma studio   # Open Prisma Studio to view data
```

### Push Schema to Database

```bash
npx prisma db push  # Push schema changes to database
```

### Generate Prisma Client

```bash
npx prisma generate  # Generate Prisma client
```

---

## 📞 Debug Information to Share

If still not working, please share:

1. **Connection test result:**
   - Visit `/api/test-db` and share the response

2. **Vercel function logs:**
   - Go to deployment → Functions
   - Check for error messages

3. **Browser console errors:**
   - Open browser DevTools
   - Check Console tab for errors

4. **DATABASE_URL format:**
   - What's the current value? (mask password)
   - Port? (5432 or 6543?)
   - Host? (db.hbufjpxdzmygjnbfsniu.supabase.co or pooler.supabase.com?)

---

## ✅ Expected Working State

When everything works:
- ✅ `/api/test-db` returns success
- ✅ Sign up creates user successfully
- ✅ Login works
- ✅ No database errors in logs

