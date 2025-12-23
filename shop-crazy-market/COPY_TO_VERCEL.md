# Copy This to Vercel

## ✅ Option 1: Try This First (Most Likely)

Copy this EXACT string into Vercel DATABASE_URL:

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Steps:**
1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Delete current value
4. Paste the string above
5. Click "Save"
6. Redeploy

---

## ✅ Option 2: If Option 1 Doesn't Work

Try this (simple username format):

```
postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Steps:**
1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. Delete current value
4. Paste the string above
5. Click "Save"
6. Redeploy

---

## ✅ Option 3: If Your Region is Different

If your Supabase region is NOT `us-east-1`, replace it:

- `us-west-1` → Replace `us-east-1` with `us-west-1`
- `eu-west-1` → Replace `us-east-1` with `eu-west-1`
- `ap-southeast-1` → Replace `us-east-1` with `ap-southeast-1`

**To find your region:**
1. Go to Supabase Dashboard
2. Check project settings
3. Look for "Region" or "Location"

---

## ✅ Option 4: Direct Connection (Temporary Test)

If pooling doesn't work, test with direct connection:

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Note:** This won't work long-term with Vercel, but good for testing if password is correct.

---

## 🎯 Recommended Order

1. **Try Option 1 first** (most likely to work)
2. **If fails, try Option 2** (different username format)
3. **If still fails, check region** (Option 3)
4. **If all fail, test with Option 4** (verify password works)

---

## ✅ After Updating

1. **Save** in Vercel
2. **Redeploy** (very important!)
3. **Test:** Visit `/api/test-db` on your deployed app
4. **Try sign up**

---

## 📋 Quick Copy-Paste

**Option 1 (Recommended):**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Option 2 (Alternative):**
```
postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

