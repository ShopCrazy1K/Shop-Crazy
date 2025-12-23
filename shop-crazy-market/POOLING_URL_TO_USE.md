# Connection Pooling URL to Use

## ✅ Use This URL in Vercel

Based on your Supabase project, use this connection pooling URL:

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**If your region is different, replace `us-east-1` with your actual region:**
- `us-east-1` (US East - most common)
- `us-west-1` (US West)
- `eu-west-1` (Europe West)
- `ap-southeast-1` (Asia Pacific)

---

## 📋 Steps to Update

### Option 1: Use the URL Above (Most Likely)

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Delete** the current value
4. **Paste** this exact value:
   ```
   postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Click "Save"
6. Redeploy

### Option 2: Get Exact URL from Supabase

If the URL above doesn't work, get the exact one:

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database
2. Scroll to "Connection Pooling" section
3. Find "Connection string" (URI format)
4. Copy that URL
5. Make sure password has `%23` (not `#`)
6. Update in Vercel

---

## 🔍 How to Verify Your Region

1. Go to Supabase Dashboard
2. Check your project settings
3. Look for "Region" or "Location"
4. Common regions:
   - US East: `us-east-1`
   - US West: `us-west-1`
   - Europe: `eu-west-1`
   - Asia: `ap-southeast-1`

---

## ✅ What Changed

**Old (Direct Connection - Port 5432):**
```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**New (Connection Pooling - Port 6543):**
```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key differences:**
- Username: `postgres` → `postgres.hbufjpxdzmygjnbfsniu`
- Host: `db.hbufjpxdzmygjnbfsniu.supabase.co` → `aws-0-us-east-1.pooler.supabase.com`
- Port: `5432` → `6543`
- Added: `?pgbouncer=true`

---

## 🎯 Try This First

Use the URL in the first section (with `us-east-1`). If it doesn't work, check your Supabase dashboard for the exact region and update accordingly.

