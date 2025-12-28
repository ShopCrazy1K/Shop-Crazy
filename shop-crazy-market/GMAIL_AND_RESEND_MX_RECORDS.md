# Gmail and Resend MX Records - They Can Coexist!

## Important: Keep Both MX Records!

You need **BOTH** MX records because they serve **different purposes**:

### 1. Gmail MX Record (Root Domain)
- **Name:** Leave blank or `@` (root domain)
- **Purpose:** Receives emails sent to addresses like:
  - `support@shopcrazymarket.com`
  - `info@shopcrazymarket.com`
  - `yourname@shopcrazymarket.com`
- **Points to:** `SMTP.GOOGLE.COM`
- **Priority:** `1`

### 2. Resend MX Record (Subdomain)
- **Name:** `send` (subdomain)
- **Purpose:** Receives bounce/complaint emails from Resend
- **Points to:** `feedback-smtp.us-east-1.amazonses.com`
- **Priority:** `10`

## Why They Don't Conflict:

- **Gmail MX** handles emails to the **root domain** (`@shopcrazymarket.com`)
- **Resend MX** handles emails to the **subdomain** (`send@shopcrazymarket.com`)

These are **completely different** and can coexist without any issues!

## Your DNS Records Should Look Like:

```
Type    Name    Priority    Points to
----    ----    --------    -----------
MX      @       1           SMTP.GOOGLE.COM          (Gmail - for receiving emails)
MX      send    10          feedback-smtp.us-east-1.amazonses.com  (Resend - for bounce emails)
TXT     resend._domainkey   -    (DKIM record for Resend)
TXT     send    -           v=spf1 include:amazonses.com ~all  (SPF for Resend)
TXT     _dmarc  -           v=DMARC1; p=none;  (DMARC)
TXT     @       -           google-site-verification=...  (Google Workspace verification)
```

## What Each Does:

### Gmail MX Record:
- ✅ Receives emails sent to your domain (support@, info@, etc.)
- ✅ Allows you to use Gmail for your business emails
- ✅ Handles incoming email for your domain

### Resend MX Record:
- ✅ Receives bounce/complaint notifications from Resend
- ✅ Helps Resend track email delivery issues
- ✅ Only affects the `send` subdomain, not your main domain

## Summary:

**DO NOT DELETE the Resend MX record!**

- Keep the Gmail MX record for `@` (root domain)
- Keep the Resend MX record for `send` (subdomain)
- They work together perfectly and don't interfere with each other

## If You Already Deleted It:

If you accidentally deleted the Resend MX record, you can add it back:

1. Go to Google Domains → DNS
2. Add record:
   - **Name:** `send`
   - **Type:** `MX`
   - **Priority:** `10`
   - **Data:** `feedback-smtp.us-east-1.amazonses.com`
   - **TTL:** `60`

This won't affect your Gmail setup at all!

