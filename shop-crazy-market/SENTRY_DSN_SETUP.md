# Sentry DSN Configuration

## Your Sentry DSN
```
https://2627665754562db07237d4a7b7b2098f@o4510621125574656.ingest.us.sentry.io/4510621126426624
```

## Setup Instructions

### 1. Add to Local Development (.env.local)
Create or update `.env.local` in your project root:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://2627665754562db07237d4a7b7b2098f@o4510621125574656.ingest.us.sentry.io/4510621126426624
```

### 2. Add to Vercel (Production)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   - **Key:** `NEXT_PUBLIC_SENTRY_DSN`
   - **Value:** `https://2627665754562db07237d4a7b7b2098f@o4510621125574656.ingest.us.sentry.io/4510621126426624`
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

### 3. Verify Setup
After deploying, you can test Sentry by:
1. Creating a test error endpoint (temporary):
   ```typescript
   // app/api/test-sentry/route.ts
   export async function GET() {
     throw new Error("Test error for Sentry");
   }
   ```
2. Visit the endpoint: `https://yourdomain.com/api/test-sentry`
3. Check your Sentry dashboard at https://sentry.io
4. You should see the error appear within seconds

### 4. Optional: Add Sentry Org and Project
For source map uploads and better integration, you can also add:
```bash
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

You can find these in your Sentry project settings.

## Current Configuration

Sentry is configured to:
- ✅ Only send errors in production (not in development)
- ✅ Filter sensitive data (passwords, tokens, etc.)
- ✅ Track performance
- ✅ Capture user sessions (replay on errors)

## Next Steps

1. ✅ Add DSN to environment variables (this file)
2. Deploy to production
3. Test error tracking
4. Set up alerts in Sentry dashboard
5. Monitor errors and performance

## Security Note

The DSN is safe to expose in client-side code (that's why it's `NEXT_PUBLIC_`). However, keep your Sentry auth token private if you add one later for source map uploads.

