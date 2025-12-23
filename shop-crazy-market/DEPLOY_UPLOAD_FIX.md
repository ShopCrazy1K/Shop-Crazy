# Deploy Upload Fix

## ❌ Current Issue

The error shows the **old code is still running** on Vercel:
- Error path: `/var/task/shop-crazy-market/public/uploads/`
- This is the OLD code that writes to filesystem

**The new code uses Supabase Storage, but it needs to be deployed!**

---

## ✅ THE FIX

### Step 1: Commit and Push Changes

**Make sure the updated code is committed:**

```bash
cd /Users/ronhart/social-app/shop-crazy-market
git add .
git commit -m "Update upload route to use Supabase Storage"
git push
```

### Step 2: Verify Code is Updated

**Check these files exist:**

- ✅ `app/api/upload/route.ts` - Should use Supabase Storage
- ✅ `lib/supabase.ts` - Should exist

### Step 3: Set Up Supabase Storage (If Not Done)

**Before deploying, set up Supabase Storage:**

1. **Create buckets:**
   - Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets
   - Create: `product-images` (Public: Yes)
   - Create: `uploads` (Public: Yes)

2. **Get API keys:**
   - Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
   - Copy: Project URL and keys

3. **Add to Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Redeploy on Vercel

1. **Go to:** Vercel → Deployments
2. **Click** "Redeploy" on latest deployment
3. **Or:** Push to GitHub (if connected) - will auto-deploy

---

## 🔍 Verify Deployment

**After redeploy, check:**

1. **Visit:** `https://your-app.vercel.app/api/upload`
   - Should NOT try to write to filesystem
   - Should use Supabase Storage

2. **Check Vercel logs:**
   - Go to deployment → Functions
   - Look for upload errors
   - Should see Supabase Storage errors (if not configured) not filesystem errors

---

## 🆘 If Still Getting Filesystem Error

**This means old code is still deployed:**

1. **Verify code is pushed to GitHub:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Force redeploy:**
   - Vercel → Deployments → Redeploy
   - Or push a new commit

3. **Check build logs:**
   - Vercel → Deployments → Latest → Build logs
   - Verify new code is being built

---

## ✅ Expected Behavior After Fix

**If Supabase is configured:**
- ✅ Uploads to Supabase Storage
- ✅ Returns Supabase Storage URL
- ✅ No filesystem errors

**If Supabase is NOT configured:**
- ✅ Falls back to data URL (for small images)
- ✅ Returns error for larger files (suggesting Supabase setup)
- ✅ No filesystem errors

---

## 📋 Quick Checklist

- [ ] Code is committed and pushed
- [ ] Supabase buckets created
- [ ] Environment variables added to Vercel
- [ ] Redeployed on Vercel
- [ ] Tested file upload
- [ ] No filesystem errors

---

## 🎯 Key Point

**The new code is ready, but you need to:**
1. **Deploy it** (push/redeploy)
2. **Set up Supabase Storage** (buckets + env vars)

Once both are done, uploads will work! 🚀

