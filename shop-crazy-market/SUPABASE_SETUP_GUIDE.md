# 🚀 Supabase PostgreSQL Setup - Step by Step

## Step-by-Step Instructions

### Step 1: Sign Up / Log In to Supabase

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** (top right) or **"Sign in"** if you have an account
3. Sign up with:
   - GitHub (recommended - fastest)
   - Email
   - Or other provider

### Step 2: Create a New Project

1. Once logged in, you'll see your dashboard
2. Click the **"New Project"** button (green button, top right)
3. You'll be asked to create/select an **Organization**:
   - If first time: Create a new organization
   - Name it whatever you want (e.g., "My Projects")
   - Click **"Create organization"**

### Step 3: Configure Your Project

Fill in the project details:

1. **Project Name**: `shop-crazy-market` (or any name you prefer)
2. **Database Password**: 
   - **IMPORTANT**: Click "Generate a password" or create a strong password
   - **SAVE THIS PASSWORD!** You'll need it for the connection string
   - Example: Copy it to a secure note/password manager
3. **Region**: 
   - Choose the region closest to you/your users
   - US regions: `West US`, `East US`
   - EU regions: `West EU`, `Central EU`
   - Asia: `Southeast Asia`, etc.
4. **Pricing Plan**: 
   - Select **"Free"** (perfect for getting started)
   - Includes: 500 MB database, 2 GB bandwidth

5. Click **"Create new project"**

### Step 4: Wait for Project Setup

- Supabase will create your project (takes 1-2 minutes)
- You'll see a progress screen
- **Don't close the tab!** Wait for it to complete

### Step 5: Get Your Connection String

Once your project is ready:

1. In the left sidebar, click **"Settings"** (gear icon ⚙️)
2. Click **"Database"** (under Project Settings)
3. Scroll down to the **"Connection string"** section
4. You'll see several tabs:
   - **URI** ← **Click this one!**
   - Transaction mode
   - Session mode
   - etc.

5. **Copy the connection string** - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

6. **Important**: Replace `[YOUR-PASSWORD]` with the password you saved in Step 3!

### Step 6: Format Your Connection String

Your connection string should look like:
```
postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres
```

**Add SSL mode** (required for secure connection):
```
postgresql://postgres:your-actual-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Step 7: Use It in Your App

**Option A: Use the Setup Script (Easiest)**
```bash
npm run setup:postgres
```
When prompted:
- Choose option **1** (Supabase)
- Paste your connection string (with `?sslmode=require` added)

**Option B: Manual Setup**
1. Open your `.env` file
2. Find or add `DATABASE_URL`
3. Paste your connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```

### Step 8: Push Schema to Database

```bash
npm run db:push
```

You should see:
```
✔ Generated Prisma Client
✔ Pushed database schema
```

### Step 9: Verify It Works

```bash
npm run db:studio
```

This opens Prisma Studio where you can see your database tables!

## ✅ Success Checklist

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Saved database password
- [ ] Copied connection string from Settings → Database → URI
- [ ] Added `?sslmode=require` to connection string
- [ ] Updated `.env` file with connection string
- [ ] Ran `npm run db:push` successfully
- [ ] Opened `npm run db:studio` and saw tables

## 🔒 Security Notes

- ✅ Never commit your `.env` file to git (already in `.gitignore`)
- ✅ Keep your database password secure
- ✅ The connection string includes your password - treat it as a secret
- ✅ Use SSL (`sslmode=require`) for secure connections

## 🆘 Troubleshooting

### "Connection refused" or "Connection timeout"
- Check your connection string format
- Verify password is correct (no extra spaces)
- Ensure `?sslmode=require` is added
- Check if project is still being created (wait a bit longer)

### "Authentication failed"
- Verify password is correct
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Try regenerating password in Supabase dashboard

### "Schema push fails"
- Run `npx prisma validate` first
- Check connection string format
- Ensure database is fully created (wait 2-3 minutes after project creation)

### Can't find connection string
- Make sure you're in **Settings** → **Database** (not API)
- Look for **"Connection string"** section (scroll down)
- Click the **"URI"** tab (not Transaction or Session)

## 📸 What to Look For

In Supabase Dashboard:
- **Left Sidebar**: Settings (gear icon) → Database
- **Connection string section**: Scroll down, you'll see tabs
- **URI tab**: This is what you want!
- **Format**: `postgresql://postgres:password@host:5432/postgres`

## 🎯 Quick Reference

**Supabase Dashboard URL**: `https://app.supabase.com`

**Connection String Location**: 
Settings → Database → Connection string → URI tab

**Full Connection String Format**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

---

**Ready?** Go to [supabase.com](https://supabase.com) and get started! 🚀

