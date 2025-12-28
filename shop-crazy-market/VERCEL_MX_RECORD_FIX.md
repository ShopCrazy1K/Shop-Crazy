# Fix: MX Record Priority in Vercel

When adding the MX record in Vercel, you need to include the **Priority** field.

## SPF MX Record Details:

- **Type:** `MX`
- **Name:** `send`
- **Value/Target:** `feedback-smtp.us-east-1.amazonses.com`
- **Priority:** `10` ← **This is required!**
- **TTL:** `60`

## In Vercel DNS Form:

When adding the MX record, make sure to fill in:
1. **Type:** Select `MX`
2. **Name:** `send`
3. **Value/Target:** `feedback-smtp.us-east-1.amazonses.com`
4. **Priority:** `10` ← **Don't forget this!**
5. **TTL:** `60`

The Priority field is required for MX records in Vercel. Set it to `10` as shown in Resend.

## Complete DNS Records Checklist:

1. ✅ **DKIM TXT** - `resend._domainkey` (Already added)
2. ⏳ **SPF MX** - `send` → `feedback-smtp.us-east-1.amazonses.com` (Priority: 10)
3. ⏳ **SPF TXT** - `send` → `v=spf1 include:amazonses.com ~all`
4. ⏳ **DMARC TXT** - `_dmarc` → `v=DMARC1; p=none;` (Optional)

Make sure to set Priority to `10` when adding the MX record!

