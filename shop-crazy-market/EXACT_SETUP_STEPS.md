# Exact Setup Steps for Supabase Storage

## 🎯 Your Project Details

- **Project Ref:** `hbufjpxdzmygjnbfsniu`
- **Project URL:** `https://hbufjpxdzmygjnbfsniu.supabase.co`

---

## ✅ Step 1: Create Storage Buckets

### Go to Supabase Storage:

**Link:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets

### Create Bucket 1: `product-images`

1. Click **"New bucket"** button
2. **Name:** `product-images`
3. **Public bucket:** ✅ **Yes** (toggle ON)
4. Click **"Create bucket"**

### Create Bucket 2: `uploads` (Fallback)

1. Click **"New bucket"** button
2. **Name:** `uploads`
3. **Public bucket:** ✅ **Yes** (toggle ON)
4. Click **"Create bucket"**

---

## ✅ Step 2: Get Supabase API Keys

### Go to Supabase API Settings:

**Link:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api

### Copy These Values:

1. **Project URL:**
   - Should be: `https://hbufjpxdzmygjnbfsniu.supabase.co`
   - Copy this value

2. **anon public key:**
   - Find "Project API keys" section
   - Look for **"anon"** or **"public"** key
   - Click **"Copy"** button
   - Save this value

3. **service_role key:**
   - Same section
   - Look for **"service_role"** key
   - ⚠️ **Keep this secret!** Don't expose in client-side code
   - Click **"Copy"** button
   - Save this value

---

## ✅ Step 3: Add to Vercel Environment Variables

### Go to Vercel:

**Link:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### Add These 3 Variables:

#### Variable 1: `NEXT_PUBLIC_SUPABASE_URL`

1. Click **"Add New"**
2. **Key:** `NEXT_PUBLIC_SUPABASE_URL`
3. **Value:** `https://hbufjpxdzmygjnbfsniu.supabase.co`
4. **Environments:** Select all (Production, Preview, Development)
5. Click **"Save"**

#### Variable 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

1. Click **"Add New"**
2. **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Value:** Paste the anon/public key from Step 2
4. **Environments:** Select all
5. Click **"Save"**

#### Variable 3: `SUPABASE_SERVICE_ROLE_KEY`

1. Click **"Add New"**
2. **Key:** `SUPABASE_SERVICE_ROLE_KEY`
3. **Value:** Paste the service_role key from Step 2
4. **Environments:** Select all
5. Click **"Save"**

---

## ✅ Step 4: Redeploy

1. **Go to:** Vercel → Deployments
2. **Click** on the latest deployment
3. **Click** the "..." menu (three dots)
4. **Click** "Redeploy"
5. **Wait** for deployment to complete

---

## ✅ Step 5: Test

1. **Try uploading a file** (product image or digital file)
2. **Check Supabase Storage:**
   - Go to: Storage → `product-images` bucket
   - Should see your uploaded file
3. **Check the URL:**
   - Should be accessible via the returned URL

---

## 📋 Quick Checklist

- [ ] Created `product-images` bucket (Public: Yes)
- [ ] Created `uploads` bucket (Public: Yes) - fallback
- [ ] Got Project URL from Supabase
- [ ] Got anon/public key from Supabase
- [ ] Got service_role key from Supabase
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Saved all environment variables
- [ ] Redeployed on Vercel
- [ ] Tested file upload

---

## 🆘 If You Get Errors

### Error: "Bucket not found"
- **Fix:** Make sure `product-images` bucket exists
- **Check:** Supabase → Storage → Buckets

### Error: "Missing Supabase environment variables"
- **Fix:** Verify all 3 environment variables are added to Vercel
- **Check:** Vercel → Settings → Environment Variables

### Error: "Permission denied"
- **Fix:** Make sure buckets are set to Public
- **Check:** Bucket settings → Public toggle

---

## 💡 Quick Links

- **Create Buckets:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/storage/buckets
- **Get API Keys:** https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
- **Vercel Env Vars:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

---

## ✅ Expected Result

Once done:
- ✅ File uploads work
- ✅ Files stored in Supabase Storage
- ✅ URLs returned for database
- ✅ Works on Vercel

Follow these steps and you're all set! 🚀

