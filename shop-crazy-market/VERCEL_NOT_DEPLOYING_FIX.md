# Vercel Not Deploying - Troubleshooting Guide

## Quick Checks

### 1. Verify Git Push
```bash
git log --oneline -3
git status
```
✅ All commits should be pushed to `origin/main`

### 2. Check GitHub Webhook
1. Go to: **GitHub → Your Repo → Settings → Webhooks**
2. Look for Vercel webhook
3. Check:
   - ✅ Status: Active (green checkmark)
   - ✅ Recent deliveries: Should show recent pushes
   - ❌ If red X: Click to see error details

### 3. Check Vercel Git Integration
1. Go to: **Vercel Dashboard → Your Project → Settings → Git**
2. Verify:
   - ✅ Repository is connected
   - ✅ Production Branch = `main`
   - ✅ Auto-deploy is enabled

### 4. Check Vercel Status
Visit: https://www.vercel-status.com/
- Check if Vercel is experiencing outages

## Common Issues & Fixes

### Issue 1: Webhook Not Connected

**Symptoms:**
- No deployments triggered after git push
- Webhook shows errors in GitHub

**Fix:**
1. Go to **Vercel Dashboard → Your Project → Settings → Git**
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select your repository
5. Configure:
   - Production Branch: `main`
   - Root Directory: Leave empty (or `shop-crazy-market` if needed)
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click **Deploy**

### Issue 2: Repository Disconnected

**Symptoms:**
- Vercel shows "Repository not connected"
- No git integration visible

**Fix:**
1. **Vercel Dashboard → Settings → Git**
2. Click **Connect Git Repository**
3. Authorize Vercel to access GitHub
4. Select your repository
5. Configure settings and deploy

### Issue 3: Wrong Branch

**Symptoms:**
- Deployments exist but not updating
- Production branch mismatch

**Fix:**
1. **Vercel Dashboard → Settings → Git**
2. Check **Production Branch**
3. Should be: `main` (or your default branch)
4. If wrong, update and redeploy

### Issue 4: Build Errors Preventing Deployment

**Symptoms:**
- Deployment starts but fails
- Red error in build logs

**Fix:**
1. **Vercel Dashboard → Deployments**
2. Click on failed deployment
3. Check **Build Logs** for errors
4. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Prisma generation errors
   - Missing dependencies

### Issue 5: Manual Deployment Not Working

**Try:**
1. **Vercel Dashboard → Deployments**
2. Click **Deploy** button
3. Select **Deploy Latest Commit**
4. Or use Vercel CLI:
   ```bash
   npx vercel --prod
   ```

## Step-by-Step Reconnection

If nothing works, reconnect the repository:

1. **Disconnect:**
   - Vercel Dashboard → Settings → Git
   - Click **Disconnect** (if connected)

2. **Reconnect:**
   - Click **Connect Git Repository**
   - Select: `ShopCrazy1K/Shop-Crazy`
   - Configure:
     - Production Branch: `main`
     - Framework Preset: Next.js
     - Root Directory: (leave empty or `shop-crazy-market`)
     - Build Command: `npm run build`
     - Output Directory: `.next`
     - Install Command: `npm install && npx prisma generate`

3. **Set Environment Variables:**
   - Go to **Settings → Environment Variables**
   - Add all required variables (see CORRECT_DATABASE_URL.md)

4. **Deploy:**
   - Click **Deploy** after connecting
   - Or push a new commit

## Force Deployment

### Option 1: Empty Commit
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### Option 2: Vercel CLI
```bash
npx vercel login
npx vercel --prod
```

### Option 3: Vercel Dashboard
1. Go to **Deployments**
2. Click **Deploy** → **Deploy Latest Commit**

## Verify Deployment Triggered

After pushing:
1. Wait 1-2 minutes
2. Check **Vercel Dashboard → Deployments**
3. Should see new deployment with status:
   - "Building" (yellow)
   - "Ready" (green)
   - "Error" (red) - check logs

## Still Not Working?

1. **Check Vercel Status Page**: https://www.vercel-status.com/
2. **Check GitHub Webhook Logs**: Look for delivery errors
3. **Try Different Branch**: Push to a different branch and connect it
4. **Contact Vercel Support**: With project name and error details

## Quick Test

Run this to verify everything is set up:
```bash
# Check git status
git status

# Check recent commits
git log --oneline -5

# Check remote
git remote -v

# Force push
git push origin main --force-with-lease
```

