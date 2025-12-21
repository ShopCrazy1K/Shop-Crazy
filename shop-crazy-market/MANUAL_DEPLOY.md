# Manual Deployment Guide

## Problem: No Deployments Showing

If you don't see any deployments in Vercel, the project might not be properly connected to GitHub.

## Solution 1: Link Project to GitHub Repository

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app
2. Click **Settings** → **Git**
3. Check if a repository is connected
4. If not connected:
   - Click **"Connect Git Repository"**
   - Select: `shart1000n-ship-it/social-app`
   - Grant permissions if needed
   - Click **"Connect"**

## Solution 2: Manual Deploy via CLI

If web deployment isn't working, use CLI:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
vercel login
vercel --prod
```

This will:
- Deploy directly from your local machine
- Ask for project configuration
- Create a deployment

## Solution 3: Create New Project

If the existing project isn't working:

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `shart1000n-ship-it/social-app`
4. Configure:
   - **Project Name**: `shop-crazy-market`
   - **Root Directory**: `shop-crazy-market`
   - **Framework**: Next.js (auto-detected)
5. Click **"Deploy"**

## Solution 4: Check GitHub Integration

1. Go to: https://vercel.com/account/integrations
2. Verify GitHub is connected
3. If not, click **"Connect GitHub"**
4. Grant access to repositories
5. Return to project and try again

## Quick Fix: Deploy via CLI Now

The fastest way is to use Vercel CLI:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
vercel login
vercel --prod
```

This will deploy your site immediately!

