# Deploy Instructions

## ✅ Quick Deploy via Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Find your project

2. **Redeploy:**
   - Click on your project
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click the "..." menu (three dots)
   - Click "Redeploy"
   - Confirm

3. **Wait for deployment to complete**

4. **Test:**
   - Try signing up
   - Try logging in
   - Should work now! 🎉

---

## 🔧 Alternative: Deploy via CLI

If you prefer using the command line:

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy:**
   ```bash
   cd /Users/ronhart/social-app/shop-crazy-market
   vercel --prod
   ```

---

## ✅ Before Deploying - Verify

Make sure you've updated `DATABASE_URL` in Vercel with the connection pooling URL:

```
postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🎯 After Deployment

1. **Check deployment logs** for any errors
2. **Test sign up** - should work now
3. **Test login** - should work now
4. **Check database connection** - should be successful

---

## 🆘 If Deployment Fails

1. **Check Vercel logs:**
   - Go to deployment
   - Click "Functions" tab
   - Check for errors

2. **Verify DATABASE_URL:**
   - Go to Settings → Environment Variables
   - Make sure it's the pooling URL (port 6543)
   - Make sure password has `%23` (not `#`)

3. **Check Supabase:**
   - Make sure database is running
   - Check connection pooling is enabled

---

## ✅ Success Indicators

- ✅ Deployment completes without errors
- ✅ Sign up works
- ✅ Login works
- ✅ No database connection errors in logs

