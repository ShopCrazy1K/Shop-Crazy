# 🔍 Connection String Location

## You're in Database Settings - Great!

The connection string might be in the **"Connection pooling"** section.

### Option 1: Check Connection Pooling Section
Look at the **"Connection pooling configuration"** section you see.

There might be:
- A connection string shown there
- Or a link/button to show connection details
- Or tabs (URI, Transaction, Session)

### Option 2: Build It Manually (Easier!)

Since you're on the Database Settings page, you can:

1. **Get your password:**
   - Scroll to **"Database password"** section
   - If you see it, copy it
   - OR click **"Reset database password"** to get a new one

2. **Build the connection string:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres?sslmode=require
   ```
   
   Replace `[YOUR-PASSWORD]` with your actual password.

### Option 3: Check Connection Pooling Docs
The "Connection pooling configuration" section says "Docs" - click that link, it might show the connection string format.

---

**Easiest:** Get your password from the "Database password" section, and I'll help you build the complete connection string!
