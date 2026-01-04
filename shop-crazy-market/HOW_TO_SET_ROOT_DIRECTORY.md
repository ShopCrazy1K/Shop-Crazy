# 📍 How to Set Root Directory in Vercel

## Quick Steps

1. Go to: https://vercel.com/dashboard
2. Click your project: shop-crazy-market
3. Click "Settings" (left sidebar)
4. Click "General" tab
5. Find "Root Directory" section
6. Click "Edit" button
7. Type: shop-crazy-market
8. Click "Save"
9. Go to "Deployments" tab
10. Click "..." on latest deployment → "Redeploy"

## Detailed Steps

### Step 1: Open Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Log in if needed

### Step 2: Select Project
- Find and click: shop-crazy-market

### Step 3: Open Settings
- Left sidebar → Click "Settings"

### Step 4: General Tab
- Click "General" tab (usually selected by default)

### Step 5: Find Root Directory
- Scroll down
- Look for "Root Directory" section
- Should show current value (probably empty or ".")

### Step 6: Edit Root Directory
- Click "Edit" button
- Type: shop-crazy-market
- No slashes, just: shop-crazy-market

### Step 7: Save
- Click "Save" button
- Wait for confirmation

### Step 8: Redeploy (IMPORTANT!)
- Go to "Deployments" tab
- Click "..." on latest deployment
- Click "Redeploy"
- Wait 2-3 minutes

## Visual Guide

```
Dashboard → Project → Settings → General
                                      ↓
                            Root Directory
                                      ↓
                          [Edit] → shop-crazy-market → Save
                                      ↓
                              Deployments → Redeploy
```

## Verify It Worked

- Root Directory shows: shop-crazy-market ✅
- Deployment logs show: Building from shop-crazy-market/
- Your site shows the updates!
