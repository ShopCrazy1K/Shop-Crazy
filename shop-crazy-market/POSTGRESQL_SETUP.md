# 🐘 PostgreSQL Setup Guide

This guide will help you migrate from SQLite to PostgreSQL for production.

## 🎯 Quick Start Options

### Option 1: Supabase (Recommended - Free Tier Available) ⭐

**Best for**: Quick setup, free tier, built-in features

1. **Sign up**: Go to [supabase.com](https://supabase.com) and create account
2. **Create project**: 
   - Click "New Project"
   - Choose organization
   - Name: "shop-crazy-market"
   - Database password: Generate strong password (save it!)
   - Region: Choose closest to you
3. **Get connection string**:
   - Go to Project Settings → Database
   - Copy "Connection string" → "URI"
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
4. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

**Free Tier Includes:**
- 500 MB database
- 2 GB bandwidth
- Automatic backups
- Built-in auth (optional)

---

### Option 2: Railway (Easy Setup)

**Best for**: Simple deployment, good free tier

1. **Sign up**: Go to [railway.app](https://railway.app) and create account
2. **Create PostgreSQL**:
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Railway auto-generates connection string
3. **Get connection string**:
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL`
4. **Update `.env`**:
   ```env
   DATABASE_URL="[RAILWAY_CONNECTION_STRING]"
   ```

**Free Tier Includes:**
- $5 credit/month
- Easy scaling

---

### Option 3: Neon (Serverless PostgreSQL)

**Best for**: Serverless, auto-scaling, modern

1. **Sign up**: Go to [neon.tech](https://neon.tech) and create account
2. **Create project**:
   - Click "Create Project"
   - Name: "shop-crazy-market"
   - Region: Choose closest
3. **Get connection string**:
   - Copy connection string from dashboard
   - Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
4. **Update `.env`**:
   ```env
   DATABASE_URL="[NEON_CONNECTION_STRING]"
   ```

**Free Tier Includes:**
- 0.5 GB storage
- Branching (database branching)
- Auto-scaling

---

### Option 4: AWS RDS / Google Cloud SQL

**Best for**: Enterprise, high scale, full control

More complex setup, but most scalable. Follow provider-specific guides.

---

## 📋 Step-by-Step Migration

### Step 1: Choose Provider & Get Connection String

Choose one of the options above and get your PostgreSQL connection string.

### Step 2: Update Prisma Schema (if needed)

Your current schema should work with PostgreSQL, but let's verify:

```bash
# Check schema compatibility
npx prisma validate
```

### Step 3: Update Environment Variables

Create/update your `.env` file:

```env
# Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Keep other variables
STRIPE_SECRET_KEY="..."
NEXT_PUBLIC_SITE_URL="..."
# etc.
```

**Important**: 
- Use `?sslmode=require` for secure connections
- Never commit `.env` to git (already in `.gitignore`)

### Step 4: Generate Prisma Client

```bash
npm run postinstall
# or
npx prisma generate
```

### Step 5: Push Schema to PostgreSQL

```bash
# Push schema to new database
npm run db:push

# OR create a migration (recommended for production)
npm run db:migrate
```

When prompted:
- Migration name: `init_postgresql`

### Step 6: Verify Connection

```bash
# Open Prisma Studio to verify
npm run db:studio
```

You should see your database tables. If empty, that's normal - you'll populate with data.

### Step 7: (Optional) Migrate Existing Data

If you have data in SQLite you want to migrate:

```bash
# Export from SQLite
sqlite3 prisma/dev.db .dump > data.sql

# Then manually import to PostgreSQL (adjust as needed)
# Or use a migration tool
```

**Note**: For fresh production deployment, you typically start with empty database.

---

## 🔧 Troubleshooting

### Issue: Connection Refused

**Solution**:
- Check connection string format
- Verify database is running
- Check firewall/network settings
- Ensure SSL is enabled (`?sslmode=require`)

### Issue: Authentication Failed

**Solution**:
- Verify username and password
- Check if user has proper permissions
- Reset database password if needed

### Issue: Schema Push Fails

**Solution**:
- Check Prisma schema syntax: `npx prisma validate`
- Verify database permissions
- Try creating migration instead: `npm run db:migrate`

### Issue: SSL Required

**Solution**:
- Add `?sslmode=require` to connection string
- Or use `?sslmode=prefer` for flexible SSL

---

## 🔒 Security Best Practices

1. **Use SSL**: Always include `?sslmode=require` in connection string
2. **Strong Password**: Use generated passwords, not simple ones
3. **Environment Variables**: Never hardcode connection strings
4. **Connection Pooling**: Prisma handles this automatically
5. **Backups**: Set up automated backups (most providers do this)

---

## 📊 Database Comparison

| Feature | SQLite (Current) | PostgreSQL (Production) |
|---------|------------------|-------------------------|
| **Concurrent Users** | Limited | Excellent |
| **Data Size** | File-based | Unlimited |
| **Performance** | Good for small apps | Excellent |
| **Backups** | Manual | Automatic |
| **Scalability** | Limited | Excellent |
| **Cost** | Free | Free tier available |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Connection string is correct
- [ ] `npx prisma validate` passes
- [ ] `npm run db:push` succeeds
- [ ] `npm run db:studio` opens and shows tables
- [ ] Can create test record in database
- [ ] Application connects successfully

---

## 🚀 Next Steps

After PostgreSQL is set up:

1. ✅ Update production environment variables
2. ✅ Test database connection
3. ✅ Run migrations
4. ✅ Deploy application
5. ✅ Monitor database performance

---

## 📚 Additional Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Docs](https://supabase.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Neon Docs](https://neon.tech/docs)

---

**Recommended**: Start with **Supabase** for easiest setup and free tier! 🎯

