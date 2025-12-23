# Sign Up Issues - Debugging Guide

## 🔍 Current Status

Sign up is still not working. Let's debug systematically.

---

## ✅ Step 1: Check What Error You're Seeing

**Please check:**

1. **Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try to sign up
   - What error message appears?

2. **Network Tab:**
   - Open DevTools → Network tab
   - Try to sign up
   - Click on the `/api/auth/signup` request
   - What's the response? (status code, error message)

3. **Vercel Logs:**
   - Go to Vercel → Deployments → Latest → Functions
   - Look for errors related to sign up
   - What error messages do you see?

---

## ✅ Step 2: Test Database Connection

**Visit this URL on your deployed app:**
```
https://your-app.vercel.app/api/test-db
```

**What does it show?**
- ✅ Success = Database connection works
- ❌ Error = Database connection is broken

---

## ✅ Step 3: Verify DATABASE_URL in Vercel

**Check your current DATABASE_URL:**

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **What value is there?**
   - Is it the pooling URL (port 6543)?
   - Is it the direct connection (port 5432)?
   - Does password have `%24%24%24` (not `$$$`)?

---

## 🆘 Common Sign Up Issues

### Issue 1: "Can't reach database server"

**Cause:** Using direct connection (port 5432) which is blocked by Supabase

**Fix:**
- Use connection pooling URL (port 6543)
- Enable connection pooling in Supabase
- Get exact URL from Supabase dashboard

### Issue 2: "Tenant or user not found"

**Cause:** Wrong password or username format

**Fix:**
- Verify password is `Puggyboy1$$$`
- Encode as `Puggyboy1%24%24%24` in URL
- Check username format (might need `postgres.hbufjpxdzmygjnbfsniu`)

### Issue 3: "User with this email already exists"

**Cause:** Email is already registered

**Fix:**
- Try a different email
- Or check if you can log in with that email

### Issue 4: "Failed to create account"

**Cause:** Database error or validation error

**Fix:**
- Check Vercel logs for detailed error
- Verify database tables exist
- Check if password meets requirements (min 6 characters)

---

## ✅ Quick Fixes to Try

### Fix 1: Use Direct Connection (Temporary)

**If pooling doesn't work, try direct connection:**

```
postgresql://postgres:Puggyboy1%24%24%24@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Note:** This might not work from Vercel, but good for testing.

### Fix 2: Enable Connection Pooling

1. **Go to:** Supabase Dashboard → Settings → Database
2. **Enable Connection Pooling**
3. **Get exact connection string**
4. **Update in Vercel**

### Fix 3: Check Database Tables

**Verify tables exist:**

1. Run locally:
   ```bash
   npx prisma studio
   ```
2. Check if `User` table exists
3. If not, run:
   ```bash
   npx prisma db push
   ```

---

## 📋 Debugging Checklist

- [ ] What exact error message do you see?
- [ ] Does `/api/test-db` work? (visit on deployed app)
- [ ] What's the current DATABASE_URL in Vercel?
- [ ] Is connection pooling enabled in Supabase?
- [ ] Do database tables exist? (check with Prisma Studio)
- [ ] What do Vercel logs show?

---

## 🎯 What to Share

Please share:
1. **Exact error message** (from browser console or Vercel logs)
2. **What `/api/test-db` returns** (visit it on your deployed app)
3. **Current DATABASE_URL format** (mask password, but show structure)
4. **Is connection pooling enabled?** (Yes/No)

This will help identify the exact issue!

---

## 💡 Most Likely Issues

1. **Database connection not working** - Check `/api/test-db`
2. **Connection pooling not enabled** - Enable in Supabase
3. **Wrong DATABASE_URL format** - Get exact from Supabase
4. **Tables don't exist** - Run `npx prisma db push`

Let's start by checking what error you're seeing!

