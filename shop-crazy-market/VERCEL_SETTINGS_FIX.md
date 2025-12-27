# Fix: Vercel Functions/Builds Conflict

## Problem
Error: "The `functions` property cannot be used in conjunction with the `builds` property"

## Solution

I've removed `vercel.json` - Next.js projects don't need it. Vercel auto-detects everything.

## Configure in Vercel Dashboard Instead

When setting up your project in Vercel Dashboard:

### 1. Framework Settings
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 2. Install Command (IMPORTANT)
In Vercel Dashboard → Settings → General → Build & Development Settings:

**Set Install Command to:**
```
npm install && npx prisma generate
```

This ensures Prisma Client is generated during install.

### 3. Remove Any Custom Functions/Builds Settings

If you see these in Vercel Dashboard:
- ❌ Remove any `functions` configuration
- ❌ Remove any `builds` configuration
- ✅ Let Vercel auto-detect for Next.js

## Why This Works

- Next.js projects are fully auto-detected by Vercel
- No `vercel.json` needed
- Prisma generation happens via `postinstall` script OR custom install command
- No conflicts between functions/builds

## After Configuration

1. ✅ Save settings in Vercel Dashboard
2. ✅ Redeploy the project
3. ✅ Error should be gone

The `postinstall` script in `package.json` will also run Prisma generate automatically, but setting it in Install Command ensures it happens during Vercel's install phase.

