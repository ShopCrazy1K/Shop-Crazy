# 🗄️ Database Setup Guide

## Quick Setup Options

### Option 1: SQLite (Easiest - No Installation Required)

SQLite is perfect for development and testing. It requires no database server installation.

1. **Create `.env` file** in the project root:
```bash
DATABASE_URL="file:./dev.db"
```

2. **Push schema to database**:
```bash
npm run db:push
```

That's it! SQLite will create a `dev.db` file automatically.

### Option 2: PostgreSQL (Recommended for Production)

#### Using Local PostgreSQL

1. **Install PostgreSQL** (if not already installed):
   - macOS: `brew install postgresql@14`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - Linux: `sudo apt-get install postgresql`

2. **Create database**:
```bash
createdb shop_crazy_market
```

3. **Create `.env` file**:
```bash
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/shop_crazy_market?schema=public"
```

Replace:
- `your_username` - Your PostgreSQL username (usually your system username)
- `your_password` - Your PostgreSQL password (leave empty if no password)

Example:
```bash
DATABASE_URL="postgresql://ronhart@localhost:5432/shop_crazy_market?schema=public"
```

4. **Push schema**:
```bash
npm run db:push
```

#### Using Supabase (Free Cloud PostgreSQL)

1. **Sign up** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Go to Settings → Database**
4. **Copy the connection string** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. **Create `.env` file**:
```bash
DATABASE_URL="postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres"
```

6. **Push schema**:
```bash
npm run db:push
```

#### Using Neon (Free Cloud PostgreSQL)

1. **Sign up** at [neon.tech](https://neon.tech)
2. **Create a new project**
3. **Copy the connection string** from the dashboard
4. **Create `.env` file** with the connection string
5. **Push schema**:
```bash
npm run db:push
```

## Step-by-Step Setup

### 1. Create `.env` File

Create a `.env` file in the project root (`/Users/ronhart/social-app/shop-crazy-market/.env`):

```bash
# Copy from .env.example
cp .env.example .env

# Or create manually
touch .env
```

### 2. Add DATABASE_URL

Open `.env` and add your database URL:

**For SQLite (easiest):**
```env
DATABASE_URL="file:./dev.db"
```

**For PostgreSQL:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/shop_crazy_market?schema=public"
```

### 3. Push Schema to Database

```bash
npm run db:push
```

This will:
- Create the database tables
- Set up all relationships
- Generate Prisma Client

### 4. Verify Setup

```bash
# Check if Prisma can connect
npx prisma db pull

# Or open Prisma Studio to view database
npm run db:studio
```

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Solution:**
1. Make sure `.env` file exists in project root
2. Check that `DATABASE_URL` is spelled correctly (case-sensitive)
3. Restart your dev server after creating `.env`

### Error: "Can't reach database server"

**For PostgreSQL:**
- Make sure PostgreSQL is running: `brew services start postgresql@14` (macOS)
- Check connection string is correct
- Verify database exists: `psql -l` (should list databases)

**For SQLite:**
- Make sure you have write permissions in the project directory
- Check that path is correct: `file:./dev.db` (relative to project root)

### Error: "Database does not exist"

**Solution:**
```bash
# Create PostgreSQL database
createdb shop_crazy_market

# Or connect to PostgreSQL and create manually
psql postgres
CREATE DATABASE shop_crazy_market;
\q
```

### Error: "Password authentication failed"

**Solution:**
- Check PostgreSQL password is correct
- Try without password if local: `postgresql://username@localhost:5432/...`
- Reset PostgreSQL password if needed

## Recommended Setup for Development

**For quick development/testing:**
```env
DATABASE_URL="file:./dev.db"
```

**For production-like environment:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/shop_crazy_market?schema=public"
```

## Next Steps

After setting up the database:

1. ✅ Create `.env` file with `DATABASE_URL`
2. ✅ Run `npm run db:push`
3. ✅ Test signup/login at http://localhost:3000/signup
4. ✅ Verify data in Prisma Studio: `npm run db:studio`

## Security Notes

- ⚠️ Never commit `.env` file to git (it's in `.gitignore`)
- ⚠️ Use different databases for development and production
- ⚠️ Use strong passwords for production databases
- ⚠️ Keep database credentials secure

