# Step-by-Step Fix for "Tenant or user not found"

## 🔍 Systematic Troubleshooting

Let's test each option one by one:

---

## ✅ Step 1: Verify Password First

**Test with direct connection to verify password is correct:**

1. Go to: Vercel → Settings → Environment Variables
2. Click on `DATABASE_URL`
3. **Replace with this (direct connection):**
   ```
   postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```
4. Click "Save"
5. Redeploy
6. Test sign up

**If this works:** Password is correct, proceed to Step 2
**If this fails:** Password is wrong, go to Step 1b

### Step 1b: Check/Reset Password

1. Go to: Supabase Dashboard → Settings → Database
2. Find "Database password" section
3. **Check what the password actually is**
4. If it's different, either:
   - Use the correct password in the URL
   - Or reset the password and use the new one

---

## ✅ Step 2: Try Pooling with Simple Username

**If Step 1 worked, try pooling with simple username:**

1. Update DATABASE_URL to:
   ```
   postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
2. Click "Save"
3. Redeploy
4. Test

**Key:** Username is just `postgres` (not `postgres.hbufjpxdzmygjnbfsniu`)

---

## ✅ Step 3: Try Pooling with Project Ref Username

**If Step 2 didn't work, try with project ref in username:**

1. Update DATABASE_URL to:
   ```
   postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
2. Click "Save"
3. Redeploy
4. Test

**Key:** Username is `postgres.hbufjpxdzmygjnbfsniu`

---

## ✅ Step 4: Get Exact URL from Supabase

**If Steps 2-3 didn't work, get the exact URL:**

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database
2. Scroll to **"Connection Pooling"** section
3. Look for **"Connection string"** (URI format)
4. **Copy that exact URL**
5. **Important:** If password has `#`, replace with `%23`
6. Update DATABASE_URL in Vercel
7. Save and redeploy

---

## ✅ Step 5: Check Supabase Connection Pooling Settings

**Verify pooling is configured correctly:**

1. Go to Supabase Dashboard → Settings → Database
2. Check "Connection Pooling" section:
   - Is it enabled?
   - What mode? (Session, Transaction, Statement)
   - What's the exact connection string shown?

3. **If pooling is not enabled:**
   - Enable it
   - Get the connection string
   - Use that in Vercel

---

## 🎯 Most Likely Issues

### Issue 1: Wrong Password
- **Symptom:** Direct connection (Step 1) fails
- **Fix:** Check/reset password in Supabase

### Issue 2: Wrong Username Format
- **Symptom:** Direct connection works, but pooling fails
- **Fix:** Try both username formats (Step 2 and Step 3)

### Issue 3: Pooling Not Enabled
- **Symptom:** No pooling URL available in Supabase
- **Fix:** Enable connection pooling in Supabase

### Issue 4: Wrong Region
- **Symptom:** Connection fails with pooling URL
- **Fix:** Check your Supabase region and use correct pooler host

---

## 📋 Quick Checklist

Go through these in order:

- [ ] **Step 1:** Test direct connection - verify password works
- [ ] **Step 2:** Try pooling with `postgres` username
- [ ] **Step 3:** Try pooling with `postgres.hbufjpxdzmygjnbfsniu` username
- [ ] **Step 4:** Get exact URL from Supabase dashboard
- [ ] **Step 5:** Verify pooling is enabled in Supabase

---

## 🆘 If Nothing Works

1. **Check Supabase Status:**
   - Is database running?
   - Any errors in dashboard?

2. **Verify Project Details:**
   - Project ref: `hbufjpxdzmygjnbfsniu` (correct?)
   - Region: What is it? (us-east-1, us-west-1, etc.)

3. **Check Vercel Logs:**
   - Go to deployment → Functions
   - Look for detailed error messages

4. **Try Different Approach:**
   - Use Supabase client instead of Prisma directly
   - Or contact Supabase support

---

## ✅ Success Criteria

You'll know it's working when:
- ✅ No "Tenant or user not found" error
- ✅ Sign up works
- ✅ Login works
- ✅ Database queries succeed

---

## 📞 What to Share

If you're still stuck, please share:
1. **Result of Step 1:** Does direct connection work?
2. **Supabase Dashboard:** What connection string does it show?
3. **Vercel DATABASE_URL:** What's the current value? (mask password)
4. **Exact error message:** Full text

