# How to Redeploy on Vercel

## ✅ Automatic Redeploy (Triggered)

I've pushed a commit to trigger automatic redeployment. Vercel will automatically detect the push and start a new deployment.

---

## 🔍 Check Deployment Status

### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/[your-project]/deployments
2. Look for the latest deployment
3. Status will show:
   - ⏳ "Building" - Deployment in progress
   - ✅ "Ready" - Deployment successful
   - ❌ "Error" - Deployment failed (check logs)

### Method 2: GitHub
1. Go to: https://github.com/ShopCrazy1K/Shop-Crazy
2. Check recent commits
3. Vercel will show deployment status on the commit

---

## 🚀 Manual Redeploy (If Needed)

If automatic redeploy doesn't work, you can manually trigger:

### Option 1: Vercel Dashboard
1. Go to: https://vercel.com/[your-project]/deployments
2. Click on the latest deployment
3. Click "..." (three dots)
4. Click "Redeploy"
5. Confirm redeploy

### Option 2: Vercel CLI (If Installed)
```bash
cd /Users/ronhart/social-app/shop-crazy-market
vercel --prod
```

---

## 📋 What Was Fixed

The following fixes are included in this deployment:

1. ✅ Next.js config warning (removed invalid `dynamicIO`)
2. ✅ Dynamic server usage errors (6 API routes fixed)
3. ✅ DATABASE_URL build error (revenue route fixed)
4. ✅ Auto-encoding DATABASE_URL password (# to %23)

---

## ⚠️ Important: Update DATABASE_URL in Vercel

Before deployment succeeds, make sure:

1. **Go to:** Vercel → Settings → Environment Variables
2. **Find:** `DATABASE_URL`
3. **Update to:**
   ```
   postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```
4. **Key change:** `Icemanbaby1991#` → `Icemanbaby1991%23`

---

## 🔍 Monitor Deployment

### Watch Build Logs
1. Go to deployment page
2. Click on the deployment
3. View "Build Logs" tab
4. Look for:
   - ✅ "Compiled successfully"
   - ✅ "Generating static pages"
   - ❌ Any errors (will be highlighted)

### Expected Build Time
- First build: ~3-5 minutes
- Subsequent builds: ~2-3 minutes

---

## ✅ Deployment Checklist

After deployment completes:

- [ ] Build succeeded (no errors)
- [ ] Site is accessible
- [ ] Database connection works
- [ ] API routes respond correctly
- [ ] Checkout flow works (if Stripe keys are set)

---

## 🆘 If Deployment Fails

1. **Check Build Logs:**
   - Look for specific error messages
   - Common issues:
     - Missing environment variables
     - DATABASE_URL encoding issues
     - TypeScript errors

2. **Verify Environment Variables:**
   - DATABASE_URL (with encoded password)
   - STRIPE keys (if using payments)
   - Other required variables

3. **Check GitHub:**
   - Ensure code is pushed
   - Verify latest commit is on main branch

---

## 📞 Need Help?

If deployment fails:
1. Check build logs in Vercel
2. Verify all environment variables are set
3. Ensure DATABASE_URL password is encoded (`%23` not `#`)
4. Check for any new errors in the logs

---

## 🎉 Success!

Once deployment succeeds:
- Your site will be live at: `https://[your-project].vercel.app`
- All fixes are now deployed
- Build should complete without errors

