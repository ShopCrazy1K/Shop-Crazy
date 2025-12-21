# 🔗 Get Connection String from Your Supabase Project

## Your Project URL
`https://hbufjpxdzmygjnbfsniu.supabase.co`

## Steps to Get Connection String

### 1. Go to Your Project Dashboard
👉 Open: **https://app.supabase.com/project/hbufjpxdzmygjnbfsniu**

Or:
- Go to [app.supabase.com](https://app.supabase.com)
- Click on your project

### 2. Navigate to Database Settings
1. In the **left sidebar**, click **"Settings"** (⚙️ gear icon)
2. Click **"Database"** (under Project Settings)

### 3. Find Connection String
1. Scroll down to the **"Connection string"** section
2. You'll see several tabs:
   - **URI** ← **Click this tab!**
   - Transaction mode
   - Session mode
   - etc.

### 4. Copy Connection String
The connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Important**: 
- You need to **replace `[YOUR-PASSWORD]`** with your actual database password
- The password is the one you set when creating the project
- If you forgot it, you can reset it in Settings → Database → Database password

### 5. Format for Use
Add `?sslmode=require` at the end:
```
postgresql://postgres:your-password@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres?sslmode=require
```

### 6. Use It
Once you have the complete connection string, run:
```bash
npm run setup:postgres
```

Or manually update your `.env` file with:
```env
DATABASE_URL="postgresql://postgres:your-password@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres?sslmode=require"
```

---

## 🔑 If You Forgot Your Password

1. Go to Settings → Database
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password
5. Use it in your connection string

---

## ✅ Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to Settings → Database
- [ ] Found Connection string → URI tab
- [ ] Copied connection string
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Added `?sslmode=require` at the end
- [ ] Ready to use!

---

**Once you have the connection string, let me know and I'll help you set it up!** 🚀

