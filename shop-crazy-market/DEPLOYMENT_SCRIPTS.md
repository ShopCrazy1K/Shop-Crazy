# 🚀 Deployment Trigger Scripts

Quick scripts to trigger Vercel deployments automatically.

## Quick Start

### Option 1: Simple Method (Recommended)
```bash
cd shop-crazy-market
npm run deploy
```

Or directly:
```bash
bash shop-crazy-market/trigger-deployment-simple.sh
```

### Option 2: Full Method
```bash
bash shop-crazy-market/trigger-deployment.sh
```

---

## What These Scripts Do

Both scripts:
1. ✅ Create a deployment marker/timestamp
2. ✅ Commit the changes
3. ✅ Push to GitHub (`main` branch)
4. ✅ Trigger Vercel auto-deploy (if enabled)

---

## Script Comparison

### `trigger-deployment-simple.sh` ⚡
- **Fastest** - Minimal changes
- Updates `.last-deployment` file
- Uses `--allow-empty` flag if no changes
- **Best for**: Quick deployments when you just need to trigger a rebuild

### `trigger-deployment.sh` 🔧
- **More comprehensive** - Updates multiple files
- Adds timestamp comment to `next.config.js`
- Creates `.deploy-trigger` file
- Better change tracking
- **Best for**: When you want detailed deployment tracking

---

## Usage Examples

### Trigger deployment from project root:
```bash
# From /Users/ronhart/social-app
bash shop-crazy-market/trigger-deployment-simple.sh
```

### Trigger deployment from shop-crazy-market directory:
```bash
# From shop-crazy-market/
cd shop-crazy-market
npm run deploy
```

### Using npm script (recommended):
```bash
cd shop-crazy-market
npm run deploy
```

---

## What Happens Next

1. Script commits and pushes to GitHub
2. Vercel detects the push (if auto-deploy enabled)
3. Deployment starts automatically (usually within 30 seconds)
4. Check status at: https://vercel.com/dashboard

---

## Troubleshooting

### Script fails with "nothing to commit"
- This is normal - script will create an empty commit
- If it still fails, check git status manually

### Deployment doesn't start after script runs
1. Check Vercel dashboard for new deployment
2. Verify auto-deploy is enabled in Vercel settings
3. Verify Vercel project is connected to correct GitHub repo
4. Check that you're pushing to the correct branch (`main`)

### Git authentication errors
- Ensure you have push access to the repository
- Check your git credentials

---

## Manual Alternative

If scripts don't work, manually redeploy:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click **"..."** → **"Redeploy"**

---

## Files Created

- `.last-deployment` - Timestamp of last deployment trigger
- `.deploy-trigger` - Full deployment metadata (full script only)

These files are tracked in git and help track deployment history.
