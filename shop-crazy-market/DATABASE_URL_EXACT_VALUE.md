# DATABASE_URL - Exact Value to Copy

## ⚠️ IMPORTANT: Copy This EXACT String

Copy this **entire string** exactly as shown:

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

## Key Points

1. **Password encoding:**
   - `Icemanbaby1991#` → `Icemanbaby1991%23`
   - The `#` must be `%23`

2. **No spaces:**
   - No spaces before or after
   - Copy the entire string

3. **Exact format:**
   ```
   postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

## How to Update in Vercel

1. **Go to Environment Variables:**
   https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

2. **Find DATABASE_URL:**
   - Click the **pencil icon** (✏️) to edit

3. **Replace the Value field with:**
   ```
   postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```

4. **Verify:**
   - Make sure you see `%23` (not `#`)
   - Make sure all environments are selected (Production, Preview, Development)

5. **Save and Redeploy:**
   - Click "Save"
   - Go to Deployments
   - Click "Redeploy"

## Visual Check

**Before (WRONG):**
```
postgresql://postgres:Icemanbaby1991#@db...
                              ↑
                         This breaks it!
```

**After (CORRECT):**
```
postgresql://postgres:Icemanbaby1991%23@db...
                              ↑↑
                         This works!
```

## Why This Matters

The `#` character in URLs is used for fragments (like `#section` in `page.html#section`). When Prisma sees `#` in the connection string, it thinks everything after `#` is a fragment, not part of the password. That's why it fails to parse the port number.

By encoding `#` as `%23`, we tell the URL parser: "This is part of the password, not a fragment."

---

**Copy the exact string above and paste it into the DATABASE_URL value field in Vercel!**

