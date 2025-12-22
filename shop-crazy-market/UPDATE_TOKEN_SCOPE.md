# Update Token Scope - Add 'workflow' Permission

## Problem
The push failed because your token needs the `workflow` scope to push `.github/workflows/deploy.yml` file.

## Solution: Update Your Token

### Step 1: Go to Token Settings
https://github.com/settings/tokens

### Step 2: Find Your Token
- Look for the token named "Shop-Crazy Deploy"
- Click the **pencil icon** (edit) next to it

### Step 3: Add Workflow Scope
- Scroll down to **"Select scopes"** section
- Check ✅ **`workflow`** (in addition to `repo` which should already be checked)
- This allows the token to update GitHub Actions workflows

### Step 4: Update Token
- Scroll to bottom
- Click **"Update token"** button
- GitHub will show you the token again
- **Copy it** (it might be the same or regenerated)

### Step 5: Share the Token
- Paste the token here
- I'll push your code immediately!

---

## Alternative: Create New Token

If you prefer to create a fresh token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Fill in:
   - **Note:** `Shop-Crazy Deploy v2`
   - **Expiration:** 90 days
   - **Scopes:** Check ✅ **`repo`** AND ✅ **`workflow`**
4. Click **"Generate token"**
5. Copy and paste here

---

## Why This Happened

Your repository has a `.github/workflows/deploy.yml` file (GitHub Actions workflow). GitHub requires the `workflow` scope to push workflow files, even if you're not actively using GitHub Actions.

---

**Once you update the token with `workflow` scope, paste it here and I'll push immediately!**

