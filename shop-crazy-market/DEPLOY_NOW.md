# Deploy Now - Quick Instructions

## ⚡ Fastest Way: Vercel Dashboard

1. **Go to**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Select**: `ShopCrazy1K / Shop-Crazy`
4. **Click**: "Import"
5. **Configure** (auto-filled, just verify):
   - Framework: Next.js ✅
   - Root Directory: (leave empty)
   - Build Command: `npm run build`
   - Install Command: `npm install && npx prisma generate`
6. **Add Environment Variable**:
   - Click "Environment Variables"
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - Add to: Production, Preview, Development
7. **Click**: "Deploy"

**That's it!** The webhook will be created automatically.

## 🔧 Or Use CLI (Requires Login)

If you want to use CLI, first login:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
npx vercel login
# Follow prompts to authenticate

# Then deploy
npx vercel --prod
```

## ✅ After Deployment

1. Check: **GitHub → Settings → Webhooks**
   - Should see Vercel webhook created

2. Test: Push a commit
   ```bash
   git commit --allow-empty -m "Test deployment"
   git push
   ```

3. Verify: **Vercel Dashboard → Deployments**
   - Should see new deployment starting

## 🎯 Current Status

- ✅ All code is pushed to GitHub
- ✅ Build works locally
- ✅ Configuration files are ready
- ⏳ Waiting for Vercel project connection

**The web dashboard method takes ~2 minutes and handles everything automatically!**
