# ⚡ Quick PostgreSQL Setup (5 Minutes)

## 🚀 Fastest Option: Supabase

### Step 1: Create Supabase Account (2 min)
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Click "New Project"
4. Fill in:
   - Name: `shop-crazy-market`
   - Database Password: **Generate and save this!**
   - Region: Choose closest
5. Click "Create new project"

### Step 2: Get Connection String (1 min)
1. Wait for project to finish creating (~2 minutes)
2. Go to **Project Settings** (gear icon) → **Database**
3. Scroll to **Connection string** section
4. Click **URI** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 3: Update Your App (2 min)

**Option A: Use Setup Script (Easiest)**
```bash
npm run setup:postgres
```
Follow the prompts and paste your connection string.

**Option B: Manual Setup**
1. Open `.env` file
2. Find `DATABASE_URL` line
3. Replace with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```
   (Add `?sslmode=require` if not already there)

### Step 4: Push Schema (1 min)
```bash
npm run db:push
```

### Step 5: Verify (30 sec)
```bash
npm run db:studio
```
You should see your database tables!

## ✅ Done!

Your PostgreSQL database is now set up and ready for production! 🎉

---

## 🔄 Alternative: Railway (Also Fast)

1. Go to [railway.app](https://railway.app)
2. Sign up → New Project → Provision PostgreSQL
3. Copy `DATABASE_URL` from Variables tab
4. Update `.env` file
5. Run `npm run db:push`

---

## 🆘 Troubleshooting

**Connection fails?**
- Check connection string format
- Ensure `?sslmode=require` is added
- Verify password is correct

**Schema push fails?**
- Run `npx prisma validate` first
- Check database permissions
- Try `npm run db:migrate` instead

---

**Total Time**: ~5 minutes ⚡

