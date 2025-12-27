# 🔧 Fix: "Failed to upload file to storage" Error

## ✅ Fix Applied
1. **Fixed file path format** - Removed bucket name from path (Supabase expects just filename)
2. **Added environment variable checks** - Validates Supabase config before upload
3. **Improved error messages** - Shows specific error details and solutions

## 🚀 Required Setup

### Step 1: Create Storage Buckets in Supabase

1. Go to Supabase Storage:
   - **Link:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets

2. Create two buckets:
   - **Bucket 1:** `product-images` (Public)
   - **Bucket 2:** `digital-files` (Public or Private)

3. For each bucket:
   - Click **"New bucket"**
   - Enter bucket name
   - Set to **Public** (for images) or **Private** (for digital files)
   - Click **"Create bucket"**

### Step 2: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add/Verify these variables:

   **Required:**
   - `NEXT_PUBLIC_SUPABASE_URL`
     - Value: `https://hbufjpxdzmygjnbfsniu.supabase.co`
   
   - `SUPABASE_SERVICE_ROLE_KEY`
     - Get from: Supabase Dashboard → Settings → API → Service Role Key
     - ⚠️ **Keep this secret!** Never expose in client-side code

   **Optional (if using client-side uploads):**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Get from: Supabase Dashboard → Settings → API → anon/public key

3. Apply to: **Production, Preview, Development** (all environments)

4. **Redeploy** after adding variables

### Step 3: Verify Setup

1. **Check Vercel Logs:**
   - Go to Deployments → Latest → Functions → `/api/upload`
   - Look for `[UPLOAD]` logs
   - Check for any error messages

2. **Test Upload:**
   - Try uploading a file
   - Check browser console for `[UPLOAD]` logs
   - Check Network tab for `/api/upload` response

## 🔍 Common Errors & Fixes

### Error: "Storage bucket not found"
**Fix:** Create the bucket in Supabase Storage
- Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets
- Create `product-images` and `digital-files` buckets

### Error: "Invalid Supabase API key"
**Fix:** Check your `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- Get the correct key from Supabase Dashboard → Settings → API
- Make sure it's the **Service Role Key**, not the anon key
- Redeploy after updating

### Error: "Missing Supabase environment variables"
**Fix:** Add environment variables to Vercel
- Add `NEXT_PUBLIC_SUPABASE_URL`
- Add `SUPABASE_SERVICE_ROLE_KEY`
- Redeploy

### Error: "Failed to upload file to storage" (generic)
**Check:**
1. Buckets exist in Supabase
2. Environment variables are set in Vercel
3. Service Role Key is correct
4. Bucket permissions allow uploads

## 📝 Checklist

- [ ] Created `product-images` bucket in Supabase
- [ ] Created `digital-files` bucket in Supabase
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Tested file upload
- [ ] Checked Vercel logs for errors
- [ ] Checked browser console for errors

## 🆘 Still Not Working?

1. **Check Vercel Function Logs:**
   - Look for `[UPLOAD]` prefixed logs
   - Check for specific error messages

2. **Check Browser Console:**
   - Look for `[UPLOAD]` and `[DIGITAL FILES]` logs
   - Check Network tab for `/api/upload` request/response

3. **Verify Supabase:**
   - Go to Storage → Buckets
   - Verify buckets exist and are accessible
   - Check bucket permissions

4. **Test Environment Variables:**
   - Create a test endpoint to verify env vars are set
   - Or check Vercel deployment logs

## 📚 Related Files
- `app/api/upload/route.ts` - Upload API endpoint
- `app/sell/page.tsx` - Frontend upload handler
- `lib/supabase.ts` - Supabase client configuration

