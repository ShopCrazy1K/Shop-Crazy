# 🎯 Quick Supabase Connection String Guide

## Fastest Path (3 Steps)

### 1. Go to Supabase
👉 **[supabase.com](https://supabase.com)** → Sign up/Login

### 2. Create Project
- Click **"New Project"**
- Name: `shop-crazy-market`
- **Generate & SAVE password** (you'll need it!)
- Choose region
- Click **"Create new project"**
- Wait 1-2 minutes for setup

### 3. Get Connection String
- Click **Settings** (⚙️) in left sidebar
- Click **"Database"**
- Scroll to **"Connection string"** section
- Click **"URI"** tab
- Copy the string (looks like):
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```
- **Replace `[YOUR-PASSWORD]`** with your saved password
- **Add `?sslmode=require`** at the end

### 4. Use It
```bash
npm run setup:postgres
```
Choose option 1 (Supabase) and paste your connection string!

---

**That's it!** Your connection string is ready! 🎉
