# Setup Guide: Rate Limiting & Sentry Error Tracking

## ✅ What's Been Set Up

### 1. Rate Limiting
- ✅ Created rate limiting utility (`lib/rate-limit.ts`)
- ✅ Pre-configured rate limiters for different use cases
- ✅ Added rate limiting to login endpoint as example
- ✅ In-memory storage (can be upgraded to Redis/Upstash later)

### 2. Sentry Error Tracking
- ✅ Installed `@sentry/nextjs` package
- ✅ Created Sentry configuration files:
  - `sentry.client.config.ts` (browser/client-side)
  - `sentry.server.config.ts` (server-side)
  - `sentry.edge.config.ts` (edge runtime)
- ✅ Updated `next.config.js` to include Sentry
- ✅ Configured to filter sensitive data
- ✅ Set to only send errors in production

---

## 🔧 Configuration Steps

### Step 1: Set Up Sentry

1. **Create a Sentry account** (if you don't have one):
   - Go to https://sentry.io/signup/
   - Create a new project (choose Next.js)

2. **Get your DSN**:
   - In your Sentry project, go to Settings → Client Keys (DSN)
   - Copy your DSN

3. **Add environment variables**:
   ```bash
   # In your .env.local or Vercel environment variables:
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
   SENTRY_ORG=your-org-slug
   SENTRY_PROJECT=your-project-slug
   ```

4. **Optional: Add to Vercel**:
   - Go to your Vercel project settings
   - Add the environment variables above
   - Redeploy your application

### Step 2: Add Rate Limiting to Critical Endpoints

Rate limiting is already added to the login endpoint as an example. To add it to other endpoints:

**Option 1: Direct usage (recommended)**
```typescript
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Apply rate limiting
  const limitResult = await rateLimiters.standard(req);
  
  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // Your handler logic here
}
```

**Option 2: Using the wrapper**
```typescript
import { withRateLimit, rateLimiters } from "@/lib/rate-limit";

const handler = async (req: Request) => {
  // Your handler logic
  return NextResponse.json({ success: true });
};

export const POST = withRateLimit(handler, rateLimiters.strict);
```

### Step 3: Choose Rate Limiter Based on Endpoint Type

Available rate limiters:
- `rateLimiters.strict` - 10 requests/minute (for sensitive operations)
- `rateLimiters.standard` - 100 requests/15 minutes (general API)
- `rateLimiters.lenient` - 1000 requests/hour (public endpoints)
- `rateLimiters.auth` - 5 requests/15 minutes (authentication)
- `rateLimiters.upload` - 20 requests/hour (file uploads)
- `rateLimiters.payment` - 10 requests/minute (payment processing)

### Step 4: Add Rate Limiting to Critical Endpoints

Recommended endpoints to add rate limiting:

**High Priority:**
- `/api/auth/login` ✅ (already done)
- `/api/auth/signup`
- `/api/upload`
- `/api/orders/checkout`
- `/api/listings/create`

**Medium Priority:**
- `/api/report` (copyright reports)
- `/api/contact`
- `/api/seller/payment-methods`

**Example: Adding to signup endpoint**
```typescript
// app/api/auth/signup/route.ts
import { rateLimiters } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limitResult = await rateLimiters.auth(req);
  if (!limitResult.success) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }
  // ... rest of signup logic
}
```

---

## 📊 Monitoring

### Sentry Dashboard
- Visit https://sentry.io to view errors
- Set up alerts for critical errors
- Monitor error trends and performance

### Rate Limiting
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: When the limit resets (timestamp)
  - `Retry-After`: Seconds until retry (when rate limited)

---

## 🚀 Production Considerations

### Rate Limiting
1. **Upgrade to Redis/Upstash** for distributed rate limiting:
   - Current implementation uses in-memory storage
   - Won't work across multiple server instances
   - Consider using Upstash Redis for production

2. **Custom rate limits**:
   - Adjust limits based on your traffic patterns
   - Consider different limits for authenticated vs anonymous users

### Sentry
1. **Source Maps** (optional):
   - Sentry will automatically upload source maps in production
   - Helps with better error stack traces

2. **Performance Monitoring**:
   - Sentry also tracks performance
   - Monitor slow API endpoints and database queries

3. **Alerts**:
   - Set up alerts for critical errors
   - Configure email/Slack notifications

---

## 🧪 Testing

### Test Rate Limiting
```bash
# Make multiple rapid requests to test rate limiting
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}'
  echo ""
done
```

### Test Sentry
1. Create a test error endpoint:
```typescript
// app/api/test-error/route.ts
export async function GET() {
  throw new Error("Test error for Sentry");
}
```

2. Visit the endpoint and check Sentry dashboard

---

## 📝 Notes

- Rate limiting is currently in-memory (resets on server restart)
- Sentry only sends errors in production (NODE_ENV=production)
- Both can be easily disabled by not setting environment variables
- Rate limiting headers help clients understand limits

---

## ✅ Checklist

- [ ] Set up Sentry account and get DSN
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to environment variables
- [ ] Add rate limiting to signup endpoint
- [ ] Add rate limiting to upload endpoint
- [ ] Add rate limiting to checkout endpoint
- [ ] Test rate limiting locally
- [ ] Verify Sentry is receiving errors (in production)
- [ ] Set up Sentry alerts
- [ ] Consider upgrading to Redis for rate limiting (optional)

---

## 🔗 Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Upstash Redis](https://upstash.com/) (for distributed rate limiting)

