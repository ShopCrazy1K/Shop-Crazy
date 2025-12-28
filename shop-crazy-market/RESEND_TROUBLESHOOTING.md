# Resend Email Troubleshooting

## Issue: Email Not Sending

The test showed `hasResendKey: true` but email failed to send. Here's how to fix it:

## Step 1: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Find `/api/test-email` function
3. Click on it to view logs
4. Look for error messages starting with "Resend error:"

Common errors you might see:

### Error: "Invalid API key"
**Fix:** Verify your `RESEND_API_KEY` in Vercel is correct
- Go to Resend Dashboard → API Keys
- Copy the key exactly (starts with `re_...`)
- Update in Vercel → Settings → Environment Variables

### Error: "Domain not verified"
**Fix:** Verify your domain in Resend
- Go to Resend Dashboard → Domains
- Add and verify `shopcrazymarket.com` (or your domain)
- Or use Resend's default domain: `onboarding.resend.dev`

### Error: "Invalid 'from' email"
**Fix:** Update EMAIL_FROM format
- Should be: `"Shop Crazy Market <noreply@yourdomain.com>"`
- If using Resend default domain: `"Shop Crazy Market <onboarding@resend.dev>"`

## Step 2: Quick Fix - Use Resend Default Domain

If you haven't verified your domain yet, you can use Resend's default domain:

1. Go to Vercel → Environment Variables
2. Update `EMAIL_FROM` to:
   ```
   Shop Crazy Market <onboarding@resend.dev>
   ```
3. Redeploy

This works immediately without domain verification.

## Step 3: Verify Resend API Key

1. Go to https://resend.com/api-keys
2. Make sure your API key is active
3. Check if you've hit any rate limits
4. Copy the key and verify it matches what's in Vercel

## Step 4: Test Again

After fixing the issue, test again:

```bash
curl -X POST https://shopcrazymarket.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "gotjuicenow@gmail.com"}'
```

## Common Issues & Solutions

### Issue: "Unauthorized"
- **Cause:** Invalid or expired API key
- **Fix:** Regenerate API key in Resend and update in Vercel

### Issue: "Domain not found"
- **Cause:** EMAIL_FROM uses unverified domain
- **Fix:** Use `onboarding@resend.dev` or verify your domain

### Issue: "Rate limit exceeded"
- **Cause:** Too many emails sent
- **Fix:** Wait or upgrade Resend plan

### Issue: Email in spam
- **Cause:** Using unverified domain
- **Fix:** Verify your domain in Resend for better deliverability

## Quick Test with Resend Default Domain

If you want to test immediately without domain verification:

1. Update `EMAIL_FROM` in Vercel to:
   ```
   Shop Crazy Market <onboarding@resend.dev>
   ```
2. Redeploy
3. Test again

This should work immediately!

