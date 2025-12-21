# 🔍 Finding Connection String in Supabase - Alternative Methods

## Method 1: Settings → Database (Most Common)

1. **Left Sidebar** → Click **"Settings"** (⚙️ gear icon at bottom)
2. Under **"Project Settings"**, click **"Database"**
3. Look for:
   - **"Connection string"** section (scroll down)
   - OR **"Connection info"** section
   - OR **"Connection pooling"** section
   - OR **"Database URL"** field

## Method 2: Settings → API (Alternative Location)

Sometimes it's under API settings:

1. **Left Sidebar** → **"Settings"** (⚙️)
2. Click **"API"** (instead of Database)
3. Look for **"Database URL"** or connection string

## Method 3: Project Settings → General

1. **Left Sidebar** → **"Settings"**
2. Click **"General"** (first option)
3. Look for database connection info

## Method 4: Direct Database Tab

1. **Left Sidebar** → Click **"Database"** (not Settings)
2. Look for connection info or settings icon within Database view

## Method 5: Build It Manually

If you can't find it, we can build it from your project info:

Your project reference: `hbufjpxdzmygjnbfsniu`

The connection string format is:
```
postgresql://postgres:[PASSWORD]@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

You just need:
- Your database password (set when creating project)
- Add `?sslmode=require` at the end

## Method 6: Check Project Settings Page

1. Go to: `https://app.supabase.com/project/hbufjpxdzmygjnbfsniu/settings/database`
2. This should take you directly to database settings
3. Look for any field showing connection information

## What to Look For

The connection string might be labeled as:
- "Connection string"
- "Database URL"
- "Connection URI"
- "Postgres connection string"
- "Connection info"
- "Database connection"

## Screenshot Guide

Look for sections like:
- **Connection string** (with tabs: URI, Transaction, Session)
- **Connection info**
- **Database URL**
- **Connection pooling** (connection string might be here)

## Still Can't Find It?

Let's try a different approach - I can help you:
1. **Reset your database password** (if you forgot it)
2. **Build the connection string manually** using your project info
3. **Use Supabase's connection pooling** URL instead

Which would you prefer?

