# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] All production environment variables are set (see `PRODUCTION_ENV.md`)
- [ ] Database connection string is configured
- [ ] Stripe production keys are set
- [ ] Webhook endpoint is configured in Stripe dashboard
- [ ] Email service is configured

### 2. Database Setup
```bash
# Run migrations
npm run db:migrate

# Or push schema (if using db:push)
npm run db:push
```

### 3. Build & Test
```bash
# Build the application
npm run build

# Test the build locally
npm start
```

## Deployment Platforms

### Vercel (Recommended for Next.js)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `PRODUCTION_ENV.md`
   - Select "Production" environment
   - Redeploy

4. **Configure Custom Domain** (optional):
   - Settings → Domains
   - Add your domain
   - Update DNS records

### Netlify

1. **Connect Repository**:
   - Go to Netlify Dashboard
   - Add new site from Git
   - Connect your repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**:
   - Site settings → Environment variables
   - Add all production variables

### Railway

1. **Create New Project**:
   - Connect GitHub repository
   - Railway will auto-detect Next.js

2. **Set Environment Variables**:
   - Variables tab
   - Add all production variables

3. **Deploy**:
   - Railway auto-deploys on push to main branch

### Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   # Build
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   # Production
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   COPY --from=builder /app/prisma ./prisma
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build & Run**:
   ```bash
   docker build -t shop-crazy-market .
   docker run -p 3000:3000 --env-file .env.production shop-crazy-market
   ```

## Post-Deployment

### 1. Verify Deployment
- [ ] Site loads at production URL
- [ ] Database connection works
- [ ] Stripe checkout works
- [ ] Webhooks are receiving events
- [ ] Email notifications work

### 2. Stripe Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Database Migrations
If you need to run migrations after deployment:
```bash
# Via CLI (if you have access)
npm run db:migrate

# Or via your hosting platform's console
```

### 4. Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor Stripe webhook events
- Check database performance
- Monitor email delivery

## Security

### Production Security Headers
The middleware automatically enables security headers in production:
- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### SSL/TLS
- Ensure your hosting platform provides SSL certificates
- Force HTTPS redirects (usually automatic on Vercel/Netlify)

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify database connection string
- Check Node.js version (requires 18+)

### Webhooks Not Working
- Verify webhook URL is accessible
- Check webhook secret matches
- Review Stripe dashboard for webhook delivery logs

### Database Connection Issues
- Verify connection string format
- Check database is accessible from hosting platform
- Ensure IP whitelist includes hosting platform IPs

## Support

For issues, check:
- Application logs in hosting platform
- Stripe webhook logs
- Database connection logs
- Browser console for client-side errors

