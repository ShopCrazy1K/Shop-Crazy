# 🔧 Build Connection String Manually

Since you can't find the connection string section, let's build it manually!

## Your Project Info
- Project Reference: `hbufjpxdzmygjnbfsniu`
- Host: `db.hbufjpxdzmygjnbfsniu.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`

## What You Need
Just your **database password** (the one you set when creating the project)

## Build the Connection String

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres?sslmode=require
```

**Steps:**
1. Replace `[YOUR-PASSWORD]` with your actual password
2. That's it!

## Example
If your password is `MySecurePass123`, it would be:
```
postgresql://postgres:MySecurePass123@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres?sslmode=require
```

## If You Forgot Your Password

1. Go to: https://app.supabase.com/project/hbufjpxdzmygjnbfsniu/settings/database
2. Scroll to **"Database password"** section
3. Click **"Reset database password"**
4. Copy the new password
5. Use it in the connection string above

## Ready to Use

Once you have the connection string, run:
```bash
npm run setup:postgres
```

Or paste it here and I'll help you set it up!
