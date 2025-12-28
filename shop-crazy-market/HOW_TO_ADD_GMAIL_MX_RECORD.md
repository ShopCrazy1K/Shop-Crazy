# How to Add Gmail MX Record in Google Domains

## Gmail MX Record Details:

- **Type:** `MX`
- **Name:** Leave blank or `@` (for root domain)
- **Priority:** `1`
- **Points to:** `SMTP.GOOGLE.COM` (or `smtp.google.com.` with a period at the end - check your DNS provider's format)
- **TTL:** Default or lowest value (usually `3600` or `60`)

## Important Note:
⚠️ **Delete any existing MX records** for your domain before adding this one, as instructed by Google Workspace.

## Step 1: Remove Existing MX Records (If Any)

1. **Go to Google Domains:**
   - Visit: https://domains.google.com
   - Sign in with your Google account

2. **Select your domain:**
   - Click on `shopcrazymarket.com`

3. **Go to DNS Settings:**
   - Click on **"DNS"** in the left sidebar

4. **Find existing MX records:**
   - Scroll down to **"Custom resource records"** section
   - Look for any records with Type `MX`
   - **Delete them** by clicking the delete/trash icon next to each one

## Step 2: Add the Gmail MX Record

1. **Still in Google Domains DNS settings**

2. **Click "Add record"** or the **"+"** button

3. **Fill in the MX record:**
   - **Name:** Leave blank or enter `@` (this means the root domain)
   - **Type:** Select `MX` from dropdown
   - **TTL:** Leave as default (usually `3600`) or set to `60` (lowest value)
   - **Priority:** Enter `1`
   - **Data:** Enter `SMTP.GOOGLE.COM` 
     - ⚠️ **Note:** Some DNS providers require a period at the end: `smtp.google.com.`
     - Try `SMTP.GOOGLE.COM` first, if it doesn't work, try `smtp.google.com.`

4. **Click "Save"**

## Step 3: Wait for DNS Propagation

- DNS changes can take **5-60 minutes** to propagate
- Sometimes it can take up to 24 hours, but usually much faster

## Step 4: Verify in Google Workspace

1. **Go back to Google Workspace:**
   - Return to the "Activate Gmail" page you were on

2. **Check the box:**
   - "Come back here and confirm once you have updated the code on your domain host"

3. **Click "Confirm"** button
   - Google will check for the MX record
   - If found, Gmail will be activated for your domain

## Important Notes:

- **Name field:** For root domain, leave blank or use `@`
  - ✅ Correct: Leave blank or `@`
  - ❌ Wrong: `shopcrazymarket.com` or `www`

- **Points to field:** Try both formats if one doesn't work:
  - `SMTP.GOOGLE.COM` (uppercase, no period)
  - `smtp.google.com.` (lowercase with period at end)

- **Priority:** Must be `1` (not `10` or any other number)

- **Delete old MX records:** Make sure to remove any existing MX records first, as Google instructed

## Troubleshooting:

**If Gmail activation fails:**
- Double-check you deleted all existing MX records
- Make sure Priority is set to `1` (not `10` or other)
- Try the alternative format for "Points to" (`smtp.google.com.` with period)
- Wait longer for DNS propagation (can take up to 24 hours)
- Verify the record was added correctly in Google Domains

**To verify the record was added:**
- In Google Domains: Go to DNS → Custom resource records
- You should see an MX record with:
  - Name: blank or `@`
  - Type: `MX`
  - Priority: `1`
  - Data: `SMTP.GOOGLE.COM` or `smtp.google.com.`

**If you're using Vercel for DNS:**
- Go to Vercel Dashboard → Your Project → Settings → Domains → shopcrazymarket.com
- Delete any existing MX records
- Add new MX record:
  - Type: `MX`
  - Name: Leave blank or `@`
  - Priority: `1`
  - Value: `SMTP.GOOGLE.COM` or `smtp.google.com.`
  - TTL: Default or `60`

## Quick Checklist:

- [ ] Deleted all existing MX records
- [ ] Added new MX record with Priority `1`
- [ ] Points to: `SMTP.GOOGLE.COM` (or `smtp.google.com.`)
- [ ] Name field is blank or `@`
- [ ] Saved the record
- [ ] Waited 5-60 minutes for DNS propagation
- [ ] Went back to Google Workspace and clicked "Confirm"
- [ ] Gmail activated successfully!

## After Activation:

Once Gmail is activated, you'll be able to:
- Create email addresses like `support@shopcrazymarket.com`
- Use Gmail for your domain
- Set up email forwarding
- Access Gmail through the Google Workspace admin console

