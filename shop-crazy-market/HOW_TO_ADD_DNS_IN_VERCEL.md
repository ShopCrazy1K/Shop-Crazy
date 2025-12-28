# How to Add DNS Records in Vercel - Complete Guide

## Step 1: Get the DNS Record Values from Resend

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/domains
   - Login to your Resend account

2. **Click on your domain** (`shopcrazymarket.com`)

3. **Find the DNS Records section:**
   - You'll see a table with DNS records that need to be added
   - Look for records with status "Pending" or "Not Found"

4. **Copy each record's values:**
   - Click on each record to see the details
   - Copy the **Name**, **Type**, **Value**, and **TTL** for each record

## Step 2: Add DNS Records in Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your **Shop Crazy Market** project

2. **Navigate to Domain Settings:**
   - Click **Settings** (top menu)
   - Click **Domains** (left sidebar)
   - Find and click on `shopcrazymarket.com`

3. **Add DNS Records:**
   - Look for **"DNS Records"** section or tab
   - Click **"Add Record"** or **"Add DNS Record"** button

4. **Fill in the record details:**
   - **Type:** Select from dropdown (TXT, MX, CNAME, etc.)
   - **Name/Host:** Enter the name from Resend (e.g., `resend._domainkey`, `send`, `_dmarc`)
   - **Value/Content:** Paste the full value from Resend
   - **TTL:** Leave as default or set to `3600` (1 hour)
   - **Priority:** Only for MX records - enter the priority number from Resend

5. **Save the record:**
   - Click **"Save"** or **"Add Record"**
   - Repeat for each DNS record from Resend

## Common DNS Records You'll Need:

### 1. DKIM Record (Required)
- **Type:** `TXT`
- **Name:** `resend._domainkey`
- **Value:** Long string starting with `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`
- **TTL:** `3600` or default

### 2. SPF MX Record (Required)
- **Type:** `MX`
- **Name:** `send`
- **Value:** `feedback-smtp.us-east-1.amazonses.com`
- **TTL:** `60`
- **Priority:** `10` ⚠️ **IMPORTANT: Don't forget this!**

### 3. SPF TXT Record (Required)
- **Type:** `TXT`
- **Name:** `send`
- **Value:** `v=spf1 include:amazonses.com ~all`
- **TTL:** `60`

### 4. DMARC Record (Optional but Recommended)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none;`
- **TTL:** `3600` or default

## Step 3: Verify the Records

1. **Wait 5-60 minutes** for DNS propagation
2. **Go back to Resend Dashboard** → Domains → shopcrazymarket.com
3. **Check the status** - it should change from "Pending" to "Verified"
4. **If still pending**, wait a bit longer (can take up to 24 hours, but usually much faster)

## Quick Checklist:

- [ ] Got DNS record values from Resend
- [ ] Added DKIM TXT record (`resend._domainkey`)
- [ ] Added SPF MX record (`send` with priority `10`)
- [ ] Added SPF TXT record (`send`)
- [ ] Added DMARC TXT record (`_dmarc`) - Optional
- [ ] Waited for DNS propagation
- [ ] Verified records in Resend dashboard

## Troubleshooting:

**If you can't find DNS settings in Vercel:**
- Make sure you're in the correct project
- Try: Settings → Domains → Click on domain name → Look for "DNS" tab
- Some domains might need to be managed through your domain registrar instead

**If records aren't verifying:**
- Double-check you copied the **entire** value (especially for DKIM - it's very long)
- Make sure the Name field matches exactly (case-sensitive)
- For MX records, make sure Priority is set correctly
- Wait longer for DNS propagation (can take up to 24 hours)

## Need Help?

If you're still missing values, go to:
1. Resend Dashboard → Domains → shopcrazymarket.com
2. Look at the "DNS Records" table
3. Each row shows: Type, Name, Value, TTL, Priority
4. Copy each value exactly as shown

