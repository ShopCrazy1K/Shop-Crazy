# Fix Push Authentication Error

## Error
```
remote: Permission to ShopCrazy1K/Shop-Crazy.git denied to shart1000n-ship-it.
fatal: unable to access 'https://github.com/ShopCrazy1K/Shop-Crazy.git/': The requested URL returned error: 403
```

## Problem
You're authenticated as `shart1000n-ship-it` but trying to push to `ShopCrazy1K/Shop-Crazy` repository.

## Solutions

### Option 1: Add Collaborator (Recommended) ⭐

**Steps:**
1. Go to: https://github.com/ShopCrazy1K/Shop-Crazy/settings/access
2. Click **"Add people"** button
3. Search for: `shart1000n-ship-it`
4. Select the user
5. Choose permission: **"Write"** (allows push)
6. Click **"Add [username] to this repository"**
7. Check your email for invitation
8. Accept the invitation

**Then push:**
```bash
cd /Users/ronhart/social-app/shop-crazy-market
git push -u origin main
```

---

### Option 2: Use Personal Access Token

**Steps:**
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `Shop-Crazy Deploy`
4. Expiration: Choose (90 days recommended)
5. Scopes: Check **`repo`** (Full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token immediately** (you won't see it again!)

**Push with token:**
```bash
cd /Users/ronhart/social-app/shop-crazy-market
git push https://[YOUR_TOKEN]@github.com/ShopCrazy1K/Shop-Crazy.git main
```

Replace `[YOUR_TOKEN]` with your actual token.

**To save token for future pushes:**
```bash
git remote set-url origin https://[YOUR_TOKEN]@github.com/ShopCrazy1K/Shop-Crazy.git
git push -u origin main
```

---

### Option 3: Switch to SSH

**If you have SSH keys set up:**

1. **Update remote URL:**
   ```bash
   git remote set-url origin git@github.com:ShopCrazy1K/Shop-Crazy.git
   ```

2. **Push:**
   ```bash
   git push -u origin main
   ```

**If you don't have SSH keys:**
1. Generate SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
2. Add to GitHub: https://github.com/settings/keys
3. Then use Option 3 above

---

## Quick Decision Guide

- **Easiest:** Option 1 (Add Collaborator) - if you have access to `ShopCrazy1K` account
- **Fastest:** Option 2 (Personal Access Token) - if you need to push immediately
- **Most Secure:** Option 3 (SSH) - for long-term use

---

## After Successful Push

Once code is pushed:

1. **Go to Vercel:**
   - https://vercel.com/shop-crazy-markets-projects/social-app/settings/git

2. **Connect Repository:**
   - Click "Connect Git Repository"
   - Search: `ShopCrazy1K/Shop-Crazy`
   - Connect

3. **Set Root Directory:**
   - Settings → General
   - Root Directory: `shop-crazy-market`
   - Save

4. **Deploy:**
   - Vercel will auto-deploy
   - OR go to Deployments → Click "Deploy"

---

## Verify Push Worked

After pushing, check:
- https://github.com/ShopCrazy1K/Shop-Crazy
- You should see your files in the repository

