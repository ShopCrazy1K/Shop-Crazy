# How to Change Your Vercel URL

There are several ways to change your Vercel URL. Here are the options:

---

## Option 1: Add a Custom Domain (Recommended) 🌟

This lets you use your own domain (e.g., `shopcrazymarket.com`) instead of the default `.vercel.app` URL.

### Steps:

1. **Go to your Vercel project:**
   - https://vercel.com/[your-username]/[your-project]/settings/domains

2. **Click "Add Domain"**

3. **Enter your domain:**
   - Example: `shopcrazymarket.com`
   - Or subdomain: `www.shopcrazymarket.com`

4. **Follow DNS setup instructions:**
   - Vercel will show you DNS records to add
   - Add them to your domain registrar (GoDaddy, Namecheap, etc.)
   - Wait for DNS propagation (can take up to 48 hours)

5. **Verify domain:**
   - Vercel will automatically verify once DNS is set up
   - You'll see a green checkmark when ready

### Benefits:
- ✅ Professional custom domain
- ✅ Better branding
- ✅ SEO benefits
- ✅ Keep default `.vercel.app` URL as backup

---

## Option 2: Change Project Name (Changes Default URL)

If you want to change the default `.vercel.app` URL, you can rename your project.

### Steps:

1. **Go to your Vercel project:**
   - https://vercel.com/[your-username]/[your-project]/settings/general

2. **Find "Project Name" section**

3. **Click "Edit" or "Rename"**

4. **Enter new project name:**
   - Example: `shop-crazy-market` → `shopcrazymarket`
   - New URL will be: `https://shopcrazymarket.vercel.app`

5. **Click "Save"**

6. **Wait for deployment:**
   - Vercel will automatically redeploy with new URL
   - Old URL will redirect to new one

### Note:
- ⚠️ Old URL will still work (redirects to new one)
- ⚠️ Project name must be unique
- ⚠️ Can only contain lowercase letters, numbers, and hyphens

---

## Option 3: Create a New Project (Fresh Start)

If you want a completely new URL, you can create a new project.

### Steps:

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import your repository:**
   - Connect to GitHub
   - Select your repository: `ShopCrazy1K/Shop-Crazy`

4. **Configure project:**
   - Choose a new project name
   - Set up environment variables
   - Deploy

5. **New URL will be:**
   - `https://[new-project-name].vercel.app`

### Note:
- ⚠️ You'll need to set up environment variables again
- ⚠️ Old project will still exist
- ⚠️ You can delete old project if not needed

---

## Option 4: Use Preview URLs

Each deployment gets a unique preview URL. You can use these for testing.

### How it works:

- **Production URL:** `https://your-project.vercel.app`
- **Preview URLs:** `https://your-project-[hash].vercel.app`
- Each commit/PR gets its own preview URL

### To get preview URL:

1. Go to **Deployments** tab
2. Click on any deployment
3. Copy the preview URL

---

## 🔧 Update Environment Variables After URL Change

If you change your URL, update this environment variable:

### NEXT_PUBLIC_SITE_URL

1. **Go to Environment Variables:**
   - https://vercel.com/[your-project]/settings/environment-variables

2. **Find or add:**
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: Your new URL (e.g., `https://shopcrazymarket.com` or `https://new-name.vercel.app`)

3. **Update for all environments:**
   - Production
   - Preview
   - Development

4. **Redeploy** your application

---

## 📋 Quick Reference

### Current Default URL Format:
```
https://[project-name].vercel.app
```

### After Custom Domain:
```
https://yourdomain.com
https://www.yourdomain.com
```

### After Project Rename:
```
https://[new-project-name].vercel.app
```

---

## 🎯 Recommended Approach

**For Production:**
1. ✅ Add custom domain (Option 1) - Best for branding
2. ✅ Keep `.vercel.app` URL as backup
3. ✅ Update `NEXT_PUBLIC_SITE_URL` environment variable

**For Development:**
- Use preview URLs for testing
- Keep default URL for quick access

---

## 🆘 Troubleshooting

### "Domain already in use"
- Domain might be connected to another Vercel project
- Check other projects in your account
- Remove domain from old project first

### "DNS not propagating"
- Wait up to 48 hours
- Check DNS records are correct
- Use DNS checker tools to verify

### "Project name taken"
- Try a different name
- Add numbers or hyphens
- Make it more unique

---

## 📚 Additional Resources

- **Vercel Domains Docs:** https://vercel.com/docs/concepts/projects/domains
- **Custom Domains Guide:** https://vercel.com/docs/concepts/projects/domains/add-a-domain
- **Project Settings:** https://vercel.com/docs/concepts/projects/overview

---

## ✅ Checklist After Changing URL

- [ ] New URL is working
- [ ] Updated `NEXT_PUBLIC_SITE_URL` environment variable
- [ ] Updated Stripe webhook URL (if using Stripe)
- [ ] Updated any external service URLs
- [ ] Tested checkout flow (if applicable)
- [ ] Verified all links work
- [ ] Updated any documentation with new URL

