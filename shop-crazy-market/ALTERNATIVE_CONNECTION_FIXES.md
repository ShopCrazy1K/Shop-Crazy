# Alternative Connection Fixes

## 🔍 If "Tenant or user not found" Persists

Try these alternative connection formats:

---

## ✅ Option 1: Direct Connection (Temporary Test)

**First, let's verify your password is correct:**

Use the direct connection URL to test if password works:

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Steps:**
1. Update DATABASE_URL in Vercel with this
2. Save and redeploy
3. Test - if this works, password is correct
4. Then switch back to pooling (this won't work long-term with Vercel)

---

## ✅ Option 2: Pooling with Just "postgres" Username

Try pooling URL with simple username:

```
postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key difference:** Username is just `postgres` (not `postgres.hbufjpxdzmygjnbfsniu`)

---

## ✅ Option 3: Transaction Mode Pooling

Try transaction mode (port 5432 but with pooling):

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Key difference:** Port is `5432` but host is still `pooler.supabase.com`

---

## ✅ Option 4: Verify Password in Supabase

The password might be wrong. Check:

1. Go to: Supabase Dashboard → Settings → Database
2. Find "Database password" section
3. Verify the password is: `Icemanbaby1991#`
4. If different, update the URL with correct password (encoded as `%23`)

---

## ✅ Option 5: Reset Database Password

If password might be wrong:

1. Go to: Supabase Dashboard → Settings → Database
2. Find "Database password" section
3. Click "Reset database password"
4. Copy the new password
5. Update DATABASE_URL with new password (encode `#` as `%23`)
6. Save and redeploy

---

## ✅ Option 6: Use Connection String from Supabase

**Most Reliable Method:**

1. Go to: Supabase Dashboard → Settings → Database
2. Scroll to "Connection string" section (NOT Connection Pooling)
3. Copy the "URI" format connection string
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Encode `#` as `%23` in the password
7. Use this in Vercel (for testing)
8. Then get the pooling version

---

## 🔧 Debugging Steps

### Step 1: Verify Current DATABASE_URL

Check what's actually in Vercel:

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Copy the exact value** (you can mask password)
4. Verify:
   - Does it have `%23` or `#`?
   - What port? (5432 or 6543?)
   - What host? (db.hbufjpxdzmygjnbfsniu.supabase.co or pooler.supabase.com?)
   - What username? (postgres or postgres.hbufjpxdzmygjnbfsniu?)

### Step 2: Test Each Format

Try each option above one by one:
1. Update DATABASE_URL
2. Save
3. Redeploy
4. Test
5. If error persists, try next option

---

## 🎯 Most Likely Issues

1. **Wrong Password:**
   - Password might not be `Icemanbaby1991#`
   - Check in Supabase dashboard

2. **Wrong Username Format:**
   - Pooling might need `postgres.hbufjpxdzmygjnbfsniu`
   - Or just `postgres`
   - Try both

3. **Wrong Host:**
   - Should be `pooler.supabase.com` for pooling
   - Not `db.hbufjpxdzmygjnbfsniu.supabase.co`

4. **Password Encoding:**
   - Must be `%23` not `#`
   - Double-check this

---

## 📋 Quick Test Checklist

Try in this order:

1. [ ] Direct connection (port 5432) - verify password works
2. [ ] Pooling with `postgres` username (port 6543)
3. [ ] Pooling with `postgres.hbufjpxdzmygjnbfsniu` username (port 6543)
4. [ ] Transaction mode pooling (port 5432, pooler host)
5. [ ] Get exact URL from Supabase dashboard

---

## 🆘 If Nothing Works

1. **Check Supabase Status:**
   - Is database running?
   - Any errors in Supabase dashboard?

2. **Verify Project Ref:**
   - Is `hbufjpxdzmygjnbfsniu` correct?
   - Check in Supabase dashboard URL

3. **Check Vercel Logs:**
   - Go to deployment → Functions
   - Look for detailed error messages

4. **Contact Support:**
   - Supabase support for connection issues
   - Or share exact error and connection string format

---

## ✅ Expected Working Format

Once working, your DATABASE_URL should:
- ✅ Connect successfully
- ✅ Allow sign up
- ✅ Allow login
- ✅ No "Tenant or user not found" error

