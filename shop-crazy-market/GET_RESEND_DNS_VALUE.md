# How to Get the Resend DNS Value

## From Resend Dashboard:

1. Go to https://resend.com/domains
2. Click on `shopcrazymarket.com` domain
3. In the **"DNS Records"** section, find the **DKIM** record
4. Look for the **"Content"** column in the table
5. Click on the content value (it's a long string starting with `p=MIGfMAOGCSqGSIb3DQEB...`)
6. **Copy the entire value** - it's quite long, make sure you get all of it

## The Record Details:

- **Type:** `TXT`
- **Name:** `resend._domainkey`
- **Content:** (The long string you copied - this is what you need)
- **TTL:** `Auto`

## Quick Copy Tip:

In the Resend dashboard, you can usually:
- Click on the content field to select all
- Or hover over it and click a "Copy" button if available
- Or triple-click to select the entire value

Make sure you copy the **complete** value - it should be a very long string (usually 200+ characters).

## What to Do Next:

Once you have the full value:
1. Go to Vercel → Your Project → Settings → Domains → shopcrazymarket.com
2. Add DNS Record:
   - Type: `TXT`
   - Name: `resend._domainkey`
   - Value: (Paste the full value you copied from Resend)
3. Save

The value should look something like:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (very long string)
```

Make sure you get the **entire** string, not just the beginning!

