# Supabase Storage Setup

## ✅ Quick Setup Guide

### Step 1: Create Storage Buckets in Supabase

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets

2. **Create Bucket 1: `product-images`**
   - Click "New bucket"
   - Name: `product-images`
   - **Public:** ✅ Yes (so images can be accessed via URL)
   - Click "Create bucket"

3. **Create Bucket 2: `digital-files`** (for digital products)
   - Click "New bucket"
   - Name: `digital-files`
   - **Public:** ❌ No (private - requires authentication to download)
   - Click "Create bucket"

4. **Or Create Single Bucket: `uploads`**
   - If you prefer one bucket for everything
   - Name: `uploads`
   - **Public:** ✅ Yes
   - Click "Create bucket"

---

### Step 2: Get Supabase Credentials

1. **Go to:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api

2. **Copy these values:**
   - **Project URL** (e.g., `https://hbufjpxdzmygjnbfsniu.supabase.co`)
   - **anon/public key** (for public buckets)
   - **service_role key** (for private buckets - keep secret!)

---

### Step 3: Add Environment Variables to Vercel

1. **Go to:** Vercel → Settings → Environment Variables

2. **Add these variables:**

   **Required:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hbufjpxdzmygjnbfsniu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Optional (for private buckets):**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Click "Save"**

4. **Redeploy** your project

---

### Step 4: Test Upload

1. **After redeploy, try uploading a file**
2. **Check Supabase Storage:**
   - Go to Storage → Your bucket
   - Should see the uploaded file
3. **Check the URL:**
   - Should be accessible via the returned URL

---

## 🔧 Bucket Configuration

### Public Bucket (for images)
- **Name:** `product-images` or `uploads`
- **Public:** ✅ Yes
- **Use:** Product images, preview images
- **Access:** Anyone with URL can view

### Private Bucket (for digital files)
- **Name:** `digital-files`
- **Public:** ❌ No
- **Use:** Digital product files (PDFs, ZIPs, etc.)
- **Access:** Requires authentication

---

## 📋 Environment Variables Checklist

Add to Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (optional, for private buckets)

---

## ✅ After Setup

1. **Create buckets** in Supabase
2. **Add environment variables** to Vercel
3. **Save and redeploy**
4. **Test file upload** - should work!

---

## 🆘 Troubleshooting

### Error: "Bucket not found"
- **Fix:** Make sure bucket exists in Supabase Storage
- **Check:** Go to Storage → Buckets → Verify bucket name

### Error: "Missing Supabase environment variables"
- **Fix:** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- **Check:** Settings → Environment Variables

### Error: "Permission denied"
- **Fix:** Check bucket is public (for images) or use service role key (for private)
- **Check:** Bucket settings → Public toggle

---

## 💡 Tips

1. **Use public buckets for images** - easier to access
2. **Use private buckets for digital files** - more secure
3. **Service role key** - needed for private bucket uploads
4. **Anon key** - works for public bucket uploads

---

## ✅ Expected Result

Once configured:
- ✅ File uploads work
- ✅ Files stored in Supabase Storage
- ✅ URLs returned for use in database
- ✅ Works on Vercel (no file system needed)

Let's get this set up! 🚀

