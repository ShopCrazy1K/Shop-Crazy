# Add All Resend DNS Records to Vercel

You've added the DKIM record. Now add the SPF records:

## Records to Add in Vercel:

### 1. SPF - MX Record (Already shown as added)
- **Type:** `MX`
- **Name:** `send`
- **Value:** `feedback-smtp.us-east-1.amazonses.com`
- **TTL:** `60`
- **Priority:** `10`

### 2. SPF - TXT Record (Add this one)
- **Type:** `TXT`
- **Name:** `send`
- **Value:** `v=spf1 include:amazonses.com ~all`
- **TTL:** `60`
- **Priority:** (leave empty)

### 3. DMARC - TXT Record (Optional but recommended)
- **Type:** `TXT`
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none;`
- **TTL:** `Auto`
- **Priority:** (leave empty)

## Steps:

1. Go to Vercel → Your Project → Settings → Domains → shopcrazymarket.com
2. Add each record one by one:
   - Click "Add Record"
   - Fill in the details above
   - Save
3. Repeat for all records

## After Adding:

- Wait 5-60 minutes for DNS propagation
- Resend will automatically verify all records
- Status will change from "Pending" to "Verified"

## Quick Checklist:

- [x] DKIM TXT record (resend._domainkey) - DONE
- [ ] SPF MX record (send) - Check if already added
- [ ] SPF TXT record (send) - ADD THIS
- [ ] DMARC TXT record (_dmarc) - Optional but recommended

Once all records are verified, your domain will be fully set up for email sending!

