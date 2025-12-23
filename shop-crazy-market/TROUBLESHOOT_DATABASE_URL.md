# Troubleshoot DATABASE_URL Error

## ✅ Good: No `#` in Vercel

If there's no `#` in your DATABASE_URL, that's correct! But let's verify the entire format.

---

## 🔍 Check These Things

### 1. Exact Value Should Be

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

### 2. Common Issues

#### ❌ Double-Encoding
**Wrong:**
```
postgresql://postgres:Icemanbaby1991%2523@db...
```
(`%2523` is `%23` encoded again)

**Correct:**
```
postgresql://postgres:Icemanbaby1991%23@db...
```

#### ❌ Missing Protocol
**Wrong:**
```
postgres:Icemanbaby1991%23@db...
```

**Correct:**
```
postgresql://postgres:Icemanbaby1991%23@db...
```

#### ❌ Extra Spaces
**Wrong:**
```
 postgresql://postgres:Icemanbaby1991%23@db... 
```
(space before or after)

**Correct:**
```
postgresql://postgres:Icemanbaby1991%23@db...
```

#### ❌ Quotes
**Wrong:**
```
"postgresql://postgres:Icemanbaby1991%23@db..."
```

**Correct:**
```
postgresql://postgres:Icemanbaby1991%23@db...
```
(No quotes in Vercel)

---

## 📋 Verification Steps

### Step 1: View Full Value in Vercel

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Copy the ENTIRE value** (click "Show" or "View" if it's hidden)

### Step 2: Compare Character by Character

Your value should match this **EXACTLY**:

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Check each part:**
- ✅ Starts with `postgresql://` (not `postgres://`)
- ✅ Has `postgres:` (username)
- ✅ Has `Icemanbaby1991%23` (password with `%23`)
- ✅ Has `@db.hbufjpxdzmygjnbfsniu.supabase.co`
- ✅ Has `:5432` (port)
- ✅ Has `/postgres` (database)
- ✅ No spaces
- ✅ No quotes
- ✅ No line breaks

### Step 3: Check for Hidden Characters

1. Copy the value from Vercel
2. Paste into a plain text editor
3. Check for any invisible characters
4. Count the characters - should be exactly 108 characters

---

## 🆘 If Format Looks Correct

If the format is correct but you still get errors, check:

### 1. Supabase Database Status

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu
2. Check if database is:
   - ✅ Running (not paused)
   - ✅ Accessible
   - ✅ Connection settings are correct

### 2. Network/Firewall

- Vercel might be blocked by Supabase firewall
- Check Supabase → Settings → Database → Connection Pooling
- Verify IP allowlist (if enabled)

### 3. Password Verification

- Double-check the password is: `Icemanbaby1991#`
- In URL it should be: `Icemanbaby1991%23`
- Not: `Icemanbaby1991` (missing `#`)
- Not: `Icemanbaby1991%2523` (double-encoded)

### 4. Try Deleting and Recreating

1. **Delete** the existing `DATABASE_URL` in Vercel
2. **Create a new one** with the exact value:
   ```
   postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```
3. **Save**
4. **Redeploy**

---

## 🔧 Alternative: Use Connection Pooling URL

If direct connection doesn't work, try Supabase's connection pooling URL:

1. Go to: Supabase Dashboard → Settings → Database
2. Find "Connection Pooling" section
3. Copy the "Connection string" (URI format)
4. Use that instead

**Format:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

## 📞 What to Share

If you're still having issues, please share:

1. **The first 30 characters** of your DATABASE_URL (you can mask the password):
   ```
   postgresql://postgres:XXXXX...
   ```

2. **The exact error message** (full text)

3. **When it occurs:**
   - During build?
   - During sign up?
   - At runtime?

4. **Supabase database status:**
   - Is it running?
   - Any connection errors in Supabase dashboard?

---

## ✅ Quick Test

To verify your URL format is correct, you can test it:

```bash
# Test URL parsing
node -e "const u = new URL('YOUR_DATABASE_URL_HERE'); console.log('✅ Valid format');"
```

If this works, the format is correct and the issue is elsewhere (database access, network, etc.).

---

## 🎯 Most Likely Issues

1. **Double-encoding** (`%2523` instead of `%23`)
2. **Extra spaces** (before/after the value)
3. **Quotes** around the value
4. **Supabase database paused** or inaccessible
5. **Network/firewall** blocking Vercel

Check these first!

