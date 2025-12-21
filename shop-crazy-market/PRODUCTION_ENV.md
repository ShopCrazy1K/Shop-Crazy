# Production Environment Variables Configuration

This guide explains how to configure environment variables for production deployment.

## Required Environment Variables

### 1. Database (PostgreSQL)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```
- **Production**: Use your production PostgreSQL connection string (e.g., Supabase, AWS RDS, etc.)
- **Important**: Never use SQLite in production

### 2. Stripe Configuration
```bash
# Production Stripe keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Webhook secret (get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET="whsec_..."
```
- **Important**: Use **live** keys (`sk_live_` and `pk_live_`) in production, not test keys
- Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

### 3. Application URL
```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```
- **Important**: Must use HTTPS in production
- No trailing slash

### 4. Node Environment
```bash
NODE_ENV="production"
```
- This enables production optimizations and security headers

## Email Configuration (Choose One)

### Option 1: Resend (Recommended)
```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
```

### Option 2: SMTP
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
```

## Platform-Specific Setup

### Vercel
1. Go to your project settings → Environment Variables
2. Add each variable above
3. Select "Production" environment
4. Redeploy

### Netlify
1. Go to Site settings → Environment variables
2. Add each variable
3. Redeploy

### Railway
1. Go to your project → Variables
2. Add each variable
3. Redeploy

### Docker/Manual
1. Create `.env.production` file
2. Add all variables
3. Set `NODE_ENV=production` when running

## Security Checklist

- [ ] Use production Stripe keys (not test keys)
- [ ] Use HTTPS URL for `NEXT_PUBLIC_SITE_URL`
- [ ] Database connection string is secure
- [ ] Webhook secret is set and matches Stripe dashboard
- [ ] Email credentials are valid
- [ ] `NODE_ENV=production` is set
- [ ] `.env` file is in `.gitignore` (never commit secrets)

## Testing Production Config

Before deploying, verify:
1. Database connection works
2. Stripe webhook endpoint is accessible
3. Email sending works
4. All API routes function correctly

## Example Production .env

```bash
# Database
DATABASE_URL="postgresql://user:pass@db.example.com:5432/shop_crazy?schema=public"

# Stripe (Production)
STRIPE_SECRET_KEY="sk_live_51..."
STRIPE_PUBLISHABLE_KEY="pk_live_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application
NEXT_PUBLIC_SITE_URL="https://shopcrazymarket.com"
NODE_ENV="production"

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@shopcrazymarket.com"
ADMIN_EMAIL="admin@shopcrazymarket.com"
```

