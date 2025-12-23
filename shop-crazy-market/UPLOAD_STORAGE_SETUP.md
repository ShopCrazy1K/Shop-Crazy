# File Upload Storage Setup

## ❌ The Problem

Vercel serverless functions have a **read-only file system**. You can't write files to `/public/uploads/` or any local directory.

**Error:** `EROFS: read-only file system`

---

## ✅ Solutions

### Option 1: Use Supabase Storage (Recommended - You're Already Using Supabase)

**Best option since you're already using Supabase!**

1. **Enable Supabase Storage:**
   - Go to: Supabase Dashboard → Storage
   - Create a bucket called `uploads` (or `product-images`, `digital-files`, etc.)
   - Set it to public (for images) or private (for digital files)

2. **Install Supabase Storage SDK:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Update upload route** to use Supabase Storage

### Option 2: Use Vercel Blob Storage

**Easy integration with Vercel:**

1. **Install Vercel Blob:**
   ```bash
   npm install @vercel/blob
   ```

2. **Get API token:**
   - Go to: Vercel Dashboard → Settings → Storage
   - Create a Blob store
   - Get the API token

3. **Update upload route** to use Vercel Blob

### Option 3: Use Cloudinary (Good for Images)

**Great for image optimization:**

1. **Sign up:** https://cloudinary.com
2. **Install:** `npm install cloudinary`
3. **Update upload route** to use Cloudinary

### Option 4: Use AWS S3

**Most flexible but more complex:**

1. **Set up S3 bucket**
2. **Install:** `npm install @aws-sdk/client-s3`
3. **Update upload route** to use S3

---

## 🎯 Recommended: Supabase Storage

**Since you're already using Supabase, this is the easiest!**

### Step 1: Enable Storage in Supabase

1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets
2. Click "New bucket"
3. Name: `uploads` (or `product-images`)
4. Set to **Public** (for images) or **Private** (for digital files)
5. Create bucket

### Step 2: Get Storage URL and Key

1. Go to: Settings → API
2. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` (for public buckets)
   - Or `SUPABASE_SERVICE_ROLE_KEY` (for private buckets)

### Step 3: Update Environment Variables in Vercel

Add to Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for private uploads)

### Step 4: Update Upload Route

I'll create a new version that uses Supabase Storage.

---

## 🔧 Quick Fix: Use Data URLs (Temporary)

**For now, small images (<2MB) will use data URLs.**

This works but:
- ❌ Not ideal for large files
- ❌ Increases database size
- ✅ Works immediately without setup

**For production, use cloud storage!**

---

## 📋 Next Steps

1. **Choose a storage solution** (Supabase Storage recommended)
2. **Set it up** (create bucket, get credentials)
3. **Update upload route** to use the storage service
4. **Update environment variables** in Vercel
5. **Test file uploads**

---

## 💡 Why This Happens

- **Local development:** File system is writable ✅
- **Vercel serverless:** File system is read-only ❌
- **Solution:** Use cloud storage ✅

---

## ✅ After Setup

Once cloud storage is configured:
- ✅ File uploads will work
- ✅ Files stored in cloud (not local)
- ✅ URLs returned for use in database
- ✅ Works on Vercel

Let me know which storage solution you want to use, and I'll update the upload route!

