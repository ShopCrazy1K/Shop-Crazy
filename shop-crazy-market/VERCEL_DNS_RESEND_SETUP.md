# Add Resend DNS Record in Vercel

Since your domain is from Vercel, here's how to add the DKIM TXT record:

## Step 1: Go to Vercel Domain Settings

1. Go to https://vercel.com/dashboard
2. Click on your **Shop Crazy Market** project
3. Go to **Settings** → **Domains**
4. Find `shopcrazymarket.com` in your domains list
5. Click on the domain name

## Step 2: Add DNS Record

1. In the domain settings, look for **"DNS Records"** or **"DNS Configuration"** section
2. Click **"Add Record"** or **"Add DNS Record"**
3. Fill in the details from Resend:
   - **Type:** `TXT`
   - **Name/Host:** `resend._domainkey`
   - **Value/Content:** Copy the full value from Resend (starts with `p=MIGfMAOGCSqGSIb3DQEB...`)
   - **TTL:** Leave as default or set to `3600`
4. Click **"Save"** or **"Add Record"**

## Step 3: Wait for Propagation

- DNS changes can take 5-60 minutes to propagate
- Resend will automatically check and verify
- The status in Resend will change from "Pending" to "Verified"

## Step 4: Verify in Resend

1. Go back to Resend Dashboard → Domains
2. Check if status changed to "Verified"
3. If still pending, wait a bit longer (DNS can take up to 24 hours, but usually much faster)

## Step 5: Update EMAIL_FROM

Once verified:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update `EMAIL_FROM` to:
   ```
   Shop Crazy Market <noreply@shopcrazymarket.com>
   ```
3. Save and redeploy

## Alternative: Vercel DNS via Project Settings

If you don't see DNS settings in the domain section:
1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Click on `shopcrazymarket.com`
4. Look for "DNS Records" tab or section
5. Add the TXT record there

## Quick Check

After adding the record, you can verify it's working:
```bash
dig TXT resend._domainkey.shopcrazymarket.com
```

Or use: https://dnschecker.org/#TXT/resend._domainkey.shopcrazymarket.com

Once the domain is verified in Resend, your email system will be fully functional for all customers!

