# Vercel Environment Variables Setup

Complete guide for adding all required environment variables to your Vercel deployment.

## 📋 Quick Access

**Vercel Environment Variables Page:**
- Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables

---

## 🔑 Required Environment Variables

### 1. Database (PostgreSQL) - **REQUIRED**

```
DATABASE_URL
```

**Value:** Your Supabase PostgreSQL connection string
```
postgresql://postgres:Icemanbaby1991#@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres
```

**How to get:**
1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/database
2. Under "Connection string" → "URI"
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual password

**Environment:** Production, Preview, Development

---

### 2. Stripe Configuration - **REQUIRED**

#### STRIPE_SECRET_KEY
```
STRIPE_SECRET_KEY
```

**Value:** Your Stripe secret key
- **Test:** `sk_test_...` (for development)
- **Live:** `sk_live_...` (for production)

**How to get:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy "Secret key"
3. Use test key for now, switch to live key when ready

**Environment:** Production, Preview, Development

---

#### STRIPE_PUBLISHABLE_KEY
```
STRIPE_PUBLISHABLE_KEY
```

**Value:** Your Stripe publishable key
- **Test:** `pk_test_...`
- **Live:** `pk_live_...`

**How to get:**
1. Same page: https://dashboard.stripe.com/apikeys
2. Copy "Publishable key"

**Environment:** Production, Preview, Development

---

#### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Value:** Same as `STRIPE_PUBLISHABLE_KEY` (must start with `pk_`)

**Note:** The `NEXT_PUBLIC_` prefix makes it available in the browser

**Environment:** Production, Preview, Development

---

#### STRIPE_WEBHOOK_SECRET
```
STRIPE_WEBHOOK_SECRET
```

**Value:** Your Stripe webhook signing secret (starts with `whsec_`)

**How to get:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint (or create one)
3. Click "Reveal" next to "Signing secret"
4. Copy the secret

**Webhook Endpoint URL:**
```
https://your-vercel-domain.vercel.app/api/webhooks/stripe
```

**Environment:** Production only

---

### 3. Application URL - **REQUIRED**

```
NEXT_PUBLIC_SITE_URL
```

**Value:** Your Vercel deployment URL
```
https://your-project.vercel.app
```

**How to get:**
1. After first deployment, Vercel will give you a URL
2. Format: `https://[project-name].vercel.app`
3. No trailing slash

**Environment:** Production, Preview, Development

**Note:** Update this after deployment with your actual domain

---

### 4. Node Environment - **REQUIRED**

```
NODE_ENV
```

**Value:**
```
production
```

**Environment:** Production only

**Note:** Vercel sets this automatically, but you can set it explicitly

---

### 4. Supabase Client Configuration - **OPTIONAL** (If using Supabase features)

#### NEXT_PUBLIC_SUPABASE_URL
```
NEXT_PUBLIC_SUPABASE_URL
```

**Value:** Your Supabase project URL
```
https://hbufjpxdzmygjnbfsniu.supabase.co
```

**How to get:**
1. Go to: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
2. Copy "Project URL"

**Environment:** Production, Preview, Development

---

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Value:** Your Supabase anonymous/public key (starts with `eyJ...`)

**How to get:**
1. Same page: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
2. Under "Project API keys"
3. Copy "anon" or "public" key
4. This is safe to expose in the browser

**Environment:** Production, Preview, Development

**Note:** The `NEXT_PUBLIC_` prefix makes it available in the browser

---

#### SUPABASE_SERVICE_ROLE_KEY (Optional - Server-side only)
```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:** Your Supabase service role key (starts with `eyJ...`)

**How to get:**
1. Same page: https://supabase.com/dashboard/project/hbufjpxdzmygjnbfsniu/settings/api
2. Under "Project API keys"
3. Copy "service_role" key
4. **⚠️ WARNING:** Never expose this in the browser! Server-side only.

**Environment:** Production, Preview (server-side only)

**Note:** Only needed if you need admin-level access from server-side code

---

## 📧 Email Configuration (Choose One)

### Option 1: Resend (Recommended) ⭐

#### RESEND_API_KEY
```
RESEND_API_KEY
```

**Value:** Your Resend API key (starts with `re_`)

**How to get:**
1. Sign up: https://resend.com
2. Go to: https://resend.com/api-keys
3. Create API key
4. Copy the key

**Environment:** Production, Preview

---

#### EMAIL_FROM
```
EMAIL_FROM
```

**Value:** Your verified sender email
```
Shop Crazy Market <noreply@yourdomain.com>
```

**How to get:**
1. In Resend dashboard, verify your domain
2. Use format: `Name <email@domain.com>`

**Environment:** Production, Preview

---

#### ADMIN_EMAIL
```
ADMIN_EMAIL
```

**Value:** Admin email for notifications
```
admin@yourdomain.com
```

**Environment:** Production, Preview

---

### Option 2: SMTP (Alternative)

If you prefer SMTP instead of Resend:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

**Note:** For Gmail, you need an "App Password" (not your regular password)

---

## 📝 Step-by-Step: Adding to Vercel

### Step 1: Navigate to Environment Variables

1. Go to: https://vercel.com/shop-crazy-markets-projects/social-app/settings/environment-variables
2. Or: Project → Settings → Environment Variables

### Step 2: Add Each Variable

For each variable above:

1. Click **"Add New"**
2. Enter the **Key** (variable name)
3. Enter the **Value** (your actual value)
4. Select **Environment(s)**:
   - ✅ Production (for live site)
   - ✅ Preview (for pull requests)
   - ✅ Development (optional, for local dev)

5. Click **"Save"**

### Step 3: Verify All Variables

Use this checklist:

- [ ] `DATABASE_URL` (Production, Preview)
- [ ] `STRIPE_SECRET_KEY` (Production, Preview, Development)
- [ ] `STRIPE_PUBLISHABLE_KEY` (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Production, Preview, Development)
- [ ] `STRIPE_WEBHOOK_SECRET` (Production only)
- [ ] `NEXT_PUBLIC_SITE_URL` (Production, Preview)
- [ ] `NODE_ENV=production` (Production only)
- [ ] `RESEND_API_KEY` (Production, Preview) OR SMTP variables
- [ ] `EMAIL_FROM` (Production, Preview)
- [ ] `ADMIN_EMAIL` (Production, Preview)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development) - Optional
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development) - Optional
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview) - Optional, server-side only

### Step 4: Redeploy

After adding variables:

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` files** - They're in `.gitignore`
2. ✅ **Use different keys for test/production**
3. ✅ **Rotate keys regularly**
4. ✅ **Use environment-specific values** (Production vs Preview)
5. ✅ **Keep webhook secret secure** - Only in Production

---

## 🧪 Testing Your Variables

After deployment, test:

1. **Database Connection:**
   - Try creating a product listing
   - Check if it saves to database

2. **Stripe:**
   - Add item to cart
   - Try checkout (use test card: `4242 4242 4242 4242`)

3. **Email:**
   - Submit a copyright report
   - Check if admin receives email

4. **Webhook:**
   - Complete a test purchase
   - Check Stripe dashboard → Webhooks → Events

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check `DATABASE_URL` format
- Verify Supabase password is correct
- Ensure database is accessible (not paused)

### "Stripe error"
- Verify keys match (test vs live)
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure webhook secret matches Stripe dashboard

### "Email not sending"
- Verify `RESEND_API_KEY` or SMTP credentials
- Check `EMAIL_FROM` is verified domain
- Check Resend dashboard for errors

### "Webhook not working"
- Verify webhook URL in Stripe: `https://your-domain.vercel.app/api/webhooks/stripe`
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure webhook is enabled in Stripe

---

## 📚 Additional Resources

- **Vercel Docs:** https://vercel.com/docs/concepts/projects/environment-variables
- **Stripe Docs:** https://stripe.com/docs/keys
- **Resend Docs:** https://resend.com/docs
- **Supabase Docs:** https://supabase.com/docs/guides/database

---

## ✅ Quick Copy-Paste Checklist

```
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NODE_ENV=production
RESEND_API_KEY=re_...
EMAIL_FROM=Shop Crazy Market <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://hbufjpxdzmygjnbfsniu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-side only)
```

**Remember:** Replace placeholder values with your actual credentials!

