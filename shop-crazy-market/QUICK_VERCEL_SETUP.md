# Quick Vercel Setup - Automated

## Option 1: Run the Setup Script (Easiest)

I've created an automated script that will:
1. Log you into Vercel
2. Link your project
3. Deploy it

**Run this command:**
```bash
./scripts/setup-vercel.sh
```

The script will:
- Open a browser for Vercel login
- Guide you through linking the project
- Optionally deploy to production

## Option 2: Manual CLI Setup

If you prefer to do it manually:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Link project
npx vercel link

# 3. Deploy
npx vercel --prod
```

## Option 3: Web Dashboard (Most Visual)

1. Go to: https://vercel.com/dashboard
2. Click **Add New Project**
3. Import: **ShopCrazy1K / Shop-Crazy**
4. Configure:
   - Framework: Next.js
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Install Command: `npm install && npx prisma generate`
5. Add Environment Variables (see CORRECT_DATABASE_URL.md)
6. Click **Deploy**

## After Setup

1. ✅ Check GitHub → Settings → Webhooks
   - Should see Vercel webhook created automatically

2. ✅ Set Environment Variables in Vercel Dashboard
   - Go to Settings → Environment Variables
   - Add `DATABASE_URL` and other required vars

3. ✅ Test Deployment
   ```bash
   git commit --allow-empty -m "Test deployment"
   git push
   ```

## Which Method to Use?

- **Script (Option 1)**: Fastest, automated
- **CLI (Option 2)**: Good if you prefer terminal
- **Web (Option 3)**: Best for visual setup and seeing all options

All methods will create the webhook automatically!

