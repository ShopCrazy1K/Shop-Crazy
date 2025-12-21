# Fix "Invalid repository URL" on Vercel

## Problem
You're seeing "Invalid repository URL" when trying to import your repository.

## Solutions

### Solution 1: Grant Vercel GitHub Access (Most Common)

1. On the Vercel "New Project" page
2. Look for **"Adjust GitHub App Permissions"** or **"Configure GitHub App"** link
3. Click it
4. Grant Vercel access to:
   - Your repositories (or specific repositories)
   - Repository contents
   - Metadata
5. Authorize the Vercel GitHub App
6. Return to Vercel and try importing again

### Solution 2: Use Full Repository URL

Instead of just the repository name, try the full GitHub URL:
```
https://github.com/shart1000n-ship-it/social-app
```

### Solution 3: Check Repository Access

1. Go to: https://github.com/shart1000n-ship-it/social-app
2. Make sure the repository exists and is accessible
3. If it's private, ensure your GitHub account has access
4. Check if the repository name is correct

### Solution 4: Manual Import via URL

1. On Vercel, look for "Import" or "Deploy" button
2. Try entering the full URL:
   ```
   https://github.com/shart1000n-ship-it/social-app
   ```
3. Or try just the owner/repo format:
   ```
   shart1000n-ship-it/social-app
   ```

### Solution 5: Deploy via Vercel CLI (Alternative)

If web import doesn't work, use CLI:

```bash
cd /Users/ronhart/social-app/shop-crazy-market
vercel login
vercel
```

### Solution 6: Create New Repository (If Needed)

If the repository doesn't exist or isn't accessible:

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/shop-crazy-market.git
   git push -u origin main
   ```
3. Then import on Vercel

## Quick Checklist

- [ ] Vercel GitHub App has access to your repositories
- [ ] Repository exists and is accessible
- [ ] You're using the correct repository name/URL
- [ ] Repository is not archived or deleted
- [ ] Your GitHub account has access to the repository

## Still Having Issues?

Try these:
1. Log out and log back into Vercel
2. Disconnect and reconnect GitHub integration
3. Use a different browser
4. Clear browser cache
5. Try the Vercel CLI method instead

