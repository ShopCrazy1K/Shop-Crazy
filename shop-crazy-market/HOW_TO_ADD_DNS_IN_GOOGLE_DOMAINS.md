# How to Add DNS Records in Google Domains

## Step 1: Get the DNS Record Values from Resend

1. **Go to Resend Dashboard:**
   - Visit: https://resend.com/domains
   - Login to your Resend account

2. **Click on your domain** (`shopcrazymarket.com`)

3. **Find the DNS Records section:**
   - You'll see a table with DNS records that need to be added
   - Look for records with status "Pending" or "Not Found"

4. **Copy each record's values:**
   - Copy the **Type**, **Name**, **Value**, **TTL**, and **Priority** (if applicable)

## Step 2: Add DNS Records in Google Domains

1. **Go to Google Domains:**
   - Visit: https://domains.google.com
   - Sign in with your Google account

2. **Select your domain:**
   - Click on `shopcrazymarket.com` (or your domain name)

3. **Navigate to DNS Settings:**
   - Click on **"DNS"** in the left sidebar
   - Or go to: **"DNS"** tab at the top

4. **Scroll down to "Custom resource records"** section

5. **Add each DNS record:**

   ### For TXT Records (DKIM, SPF, DMARC):
   
   - Click **"Add record"** or the **"+"** button
   - **Name:** Enter the name from Resend (e.g., `resend._domainkey`, `send`, `_dmarc`)
     - ⚠️ **Important:** For subdomains, enter just the subdomain part (e.g., `resend._domainkey` not `resend._domainkey.shopcrazymarket.com`)
   - **Type:** Select `TXT` from dropdown
   - **TTL:** Enter the TTL from Resend (usually `3600` or `60`) or leave as default
   - **Data:** Paste the full value from Resend
     - ⚠️ **Important:** For DKIM, this is a very long string - make sure you copy the entire value!
   - Click **"Save"**

   ### For MX Records (SPF):
   
   - Click **"Add record"** or the **"+"** button
   - **Name:** Enter `send` (or the name from Resend)
   - **Type:** Select `MX` from dropdown
   - **TTL:** Enter `60` or leave as default
   - **Priority:** Enter `10` (or the priority from Resend)
   - **Data:** Enter `feedback-smtp.us-east-1.amazonses.com` (or the value from Resend)
   - Click **"Save"**

## Common DNS Records You'll Need:

### 1. DKIM Record (Required)
- **Type:** `TXT`
- **Name:** `resend._domainkey`
- **Data/Value:** Long string starting with `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`
- **TTL:** `3600` or default

### 2. SPF MX Record (Required)
- **Type:** `MX`
- **Name:** `send`
- **Priority:** `10` ⚠️ **IMPORTANT: Don't forget this!**
- **Data/Value:** `feedback-smtp.us-east-1.amazonses.com`
- **TTL:** `60`

### 3. SPF TXT Record (Required)
- **Type:** `TXT`
- **Name:** `send`
- **Data/Value:** `v=spf1 include:amazonses.com ~all`
- **TTL:** `60`

### 4. DMARC Record (Optional but Recommended)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Data/Value:** `v=DMARC1; p=none;`
- **TTL:** `3600` or default

## Step 3: Verify the Records

1. **Wait 5-60 minutes** for DNS propagation
2. **Go back to Resend Dashboard** → Domains → shopcrazymarket.com
3. **Check the status** - it should change from "Pending" to "Verified"
4. **If still pending**, wait a bit longer (can take up to 24 hours, but usually much faster)

## Important Notes for Google Domains:

- **Name field:** Only enter the subdomain part, not the full domain
  - ✅ Correct: `resend._domainkey`
  - ❌ Wrong: `resend._domainkey.shopcrazymarket.com`

- **TTL:** Google Domains might have a default TTL - you can leave it or set to match Resend's requirement

- **Priority:** Only needed for MX records - make sure to include it!

- **Data/Value field:** Make sure to copy the **entire** value, especially for DKIM (it's very long)

## Quick Checklist:

- [ ] Got DNS record values from Resend
- [ ] Logged into Google Domains
- [ ] Went to DNS settings for shopcrazymarket.com
- [ ] Added DKIM TXT record (`resend._domainkey`)
- [ ] Added SPF MX record (`send` with priority `10`)
- [ ] Added SPF TXT record (`send`)
- [ ] Added DMARC TXT record (`_dmarc`) - Optional
- [ ] Waited for DNS propagation
- [ ] Verified records in Resend dashboard

## Troubleshooting:

**If records aren't showing up:**
- Make sure you entered the Name correctly (just the subdomain, not full domain)
- Double-check you copied the entire Value/Data (especially for DKIM)
- Wait longer for DNS propagation (can take up to 24 hours)

**If you can't find DNS settings:**
- Make sure you're logged into the correct Google account
- The domain must be registered with Google Domains
- Look for "DNS" in the left sidebar or top navigation

**To verify DNS records are added:**
- In Google Domains, go to DNS → Custom resource records
- You should see all your added records listed there
- Check that the Name, Type, and Data match what Resend requires

## Need Help?

If you're still missing values, go to:
1. Resend Dashboard → Domains → shopcrazymarket.com
2. Look at the "DNS Records" table
3. Each row shows: Type, Name, Value, TTL, Priority
4. Copy each value exactly as shown

