# How to Add Google Workspace Domain Verification TXT Record

## Your Verification Code:
```
google-site-verification=tdqO7bxVqdF317PBvQHP_7hX0ODTr0oDm5yOrF1wn_U
```

## Step 1: Determine Where Your DNS is Managed

Your domain `shopcrazymarket.com` DNS can be managed in either:
- **Google Domains** (if you registered the domain there)
- **Vercel** (if you added the domain to Vercel and it's managing DNS)

## Option A: Add in Google Domains

1. **Go to Google Domains:**
   - Visit: https://domains.google.com
   - Sign in with your Google account

2. **Select your domain:**
   - Click on `shopcrazymarket.com`

3. **Go to DNS Settings:**
   - Click on **"DNS"** in the left sidebar

4. **Scroll down to "Custom resource records"** section

5. **Add the TXT record:**
   - Click **"Add record"** or the **"+"** button
   - **Name:** Leave blank or enter `@` (this means the root domain)
   - **Type:** Select `TXT` from dropdown
   - **TTL:** Leave as default (usually `3600`) or set to `3600`
   - **Data:** Paste the entire verification code:
     ```
     google-site-verification=tdqO7bxVqdF317PBvQHP_7hX0ODTr0oDm5yOrF1wn_U
     ```
   - Click **"Save"**

## Option B: Add in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your **Shop Crazy Market** project

2. **Navigate to Domain Settings:**
   - Click **Settings** (top menu)
   - Click **Domains** (left sidebar)
   - Find and click on `shopcrazymarket.com`

3. **Add DNS Record:**
   - Look for **"DNS Records"** section or tab
   - Click **"Add Record"** or **"Add DNS Record"** button

4. **Fill in the record:**
   - **Type:** Select `TXT` from dropdown
   - **Name/Host:** Leave blank or enter `@` (for root domain)
   - **Value/Content:** Paste the entire verification code:
     ```
     google-site-verification=tdqO7bxVqdF317PBvQHP_7hX0ODTr0oDm5yOrF1wn_U
     ```
   - **TTL:** Leave as default or set to `3600`
   - Click **"Save"** or **"Add Record"**

## Step 2: Wait for DNS Propagation

- DNS changes can take **5-60 minutes** to propagate
- Sometimes it can take up to 24 hours, but usually much faster

## Step 3: Verify in Google Workspace

1. **Go back to Google Workspace:**
   - Return to the verification page you were on
   - Check the box: "Come back here and confirm once you have updated the code on your domain host"
   - Click **"Confirm"** button

2. **Google will check for the TXT record:**
   - If found, your domain will be verified
   - If not found, wait a bit longer and try again

## Important Notes:

- **Name field:** For root domain verification, leave blank or use `@`
  - ✅ Correct: Leave blank or `@`
  - ❌ Wrong: `shopcrazymarket.com` or `www`

- **Value field:** Copy the **entire** verification string including `google-site-verification=`
  - ✅ Correct: `google-site-verification=tdqO7bxVqdF317PBvQHP_7hX0ODTr0oDm5yOrF1wn_U`
  - ❌ Wrong: Just the code part without the prefix

- **TTL:** Can be left as default, but `3600` (1 hour) is standard

## Troubleshooting:

**If verification fails:**
- Double-check you copied the entire value (including `google-site-verification=`)
- Make sure the Name field is blank or `@` (not the full domain name)
- Wait longer for DNS propagation (can take up to 24 hours)
- Try using a DNS checker: https://dnschecker.org/#TXT/shopcrazymarket.com

**To verify the record was added:**
- In Google Domains: Go to DNS → Custom resource records, you should see the TXT record
- In Vercel: Go to Settings → Domains → shopcrazymarket.com → DNS Records, you should see it listed

**If you're not sure where DNS is managed:**
- Check where you registered the domain
- If registered with Google, use Google Domains
- If domain is just added to Vercel, check Vercel's DNS settings

## Quick Checklist:

- [ ] Determined where DNS is managed (Google Domains or Vercel)
- [ ] Added TXT record with Name blank or `@`
- [ ] Pasted the full verification code (including `google-site-verification=`)
- [ ] Saved the record
- [ ] Waited 5-60 minutes for DNS propagation
- [ ] Went back to Google Workspace and clicked "Confirm"
- [ ] Domain verified successfully!

