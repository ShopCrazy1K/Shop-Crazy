# Where to Update DATABASE_URL in Vercel

## Step-by-Step Instructions

### Step 1: Go to Your Vercel Project

**Direct Link:**
https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

**OR navigate:**
1. Go to: https://vercel.com
2. Click on your project: **"social-app"**
3. Click **"Settings"** (top menu)
4. Click **"Environment Variables"** (left sidebar)

### Step 2: Find or Add DATABASE_URL

**If DATABASE_URL already exists:**
- Look for the row with **Key:** `DATABASE_URL`
- Click the **pencil icon** (✏️) on the right side of that row

**If DATABASE_URL doesn't exist:**
- Click the **"Add New"** button (usually at the top)
- A form will appear

### Step 3: Enter the Values

In the form that appears:

1. **Key:** 
   ```
   DATABASE_URL
   ```
   (Type exactly: `DATABASE_URL`)

2. **Value:**
   ```
   postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
   ```
   (Copy and paste this entire string)

3. **Environment(s):**
   - Check ✅ **Production**
   - Check ✅ **Preview**
   - Check ✅ **Development**
   (Select ALL three)

### Step 4: Save

- Click the **"Save"** button
- The variable will be saved

### Step 5: Redeploy

After saving:

1. Go to **"Deployments"** tab (top menu)
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Confirm redeploy

## Visual Guide

```
Vercel Dashboard
  └── Your Project (social-app)
      └── Settings
          └── Environment Variables
              └── [Add New] or [Edit existing DATABASE_URL]
                  ├── Key: DATABASE_URL
                  ├── Value: postgresql://postgres:Icemanbaby1991%23@...
                  └── Environments: ✅ Production ✅ Preview ✅ Development
```

## Exact String to Paste

Copy this entire string into the **Value** field:

```
postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**Important:** 
- Make sure `%23` is in there (not `#`)
- Copy the entire string from `postgresql://` to the end
- No extra spaces before or after

## Troubleshooting

### Can't find Environment Variables?
- Make sure you're in **Settings** tab
- Look in the left sidebar menu
- It should be under "Configuration" section

### Can't edit existing variable?
- Click the pencil icon (✏️) on the right side of the row
- Or delete it and create a new one

### Still having issues?
- Make sure you're logged into the correct Vercel account
- Verify you have access to the project
- Try refreshing the page

---

**Once you've updated DATABASE_URL and redeployed, the build should succeed!**

