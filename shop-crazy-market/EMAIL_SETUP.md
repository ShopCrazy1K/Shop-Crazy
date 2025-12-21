# 📧 Email Notification Setup

## Overview

The copyright protection system includes email notifications for:
- **Admins**: When new copyright reports are submitted
- **Sellers**: When their products are reported or strikes are issued

## Email Providers

The system supports two email providers:

### 1. Resend (Recommended for Production)

**Setup:**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env`:
```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="Shop Crazy Market <noreply@yourdomain.com>"
ADMIN_EMAIL="admin@yourdomain.com"
```

**Benefits:**
- Easy setup
- Good deliverability
- Free tier: 3,000 emails/month
- Built-in analytics

### 2. Nodemailer (SMTP - Alternative)

**Setup:**
1. Use any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
2. Add to `.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Shop Crazy Market <noreply@yourdomain.com>"
ADMIN_EMAIL="admin@yourdomain.com"
```

**Gmail Setup:**
- Enable 2-factor authentication
- Generate an app-specific password
- Use that password in `SMTP_PASS`

### 3. Development Mode (No Setup Required)

If neither provider is configured, emails will be logged to the console instead of being sent. This is perfect for development and testing.

## Environment Variables

Add these to your `.env` file:

```env
# Required for email notifications
EMAIL_FROM="Shop Crazy Market <noreply@shopcrazymarket.com>"
ADMIN_EMAIL="admin@shopcrazymarket.com"

# Resend (recommended)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# OR SMTP (alternative)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"

# Site URL for email links
NEXT_PUBLIC_SITE_URL="https://shopcrazymarket.com"
```

## Email Templates

### Admin Notification (New Report)
- **To**: Admin email
- **Subject**: "New Copyright Report: [Product Title]"
- **Content**: Report details and link to admin dashboard

### Seller Notification (Product Reported)
- **To**: Seller email
- **Subject**: "Product Reported: [Product Title]"
- **Content**: Notification that their product was reported

### Strike Notification
- **To**: Seller email
- **Subject**: "Seller Strike Issued - Shop Crazy Market"
- **Content**: Strike details and appeal instructions

## Testing

### Test Email Sending

```bash
# In development, check console logs
# Emails will be logged instead of sent if no provider is configured
```

### Test with Resend

1. Set `RESEND_API_KEY` in `.env`
2. Submit a copyright report
3. Check Resend dashboard for sent emails

### Test with SMTP

1. Configure SMTP settings in `.env`
2. Submit a copyright report
3. Check your email inbox

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Ensure all required vars are set
2. **Check provider status**: Verify API key/SMTP credentials are correct
3. **Check console logs**: Errors will be logged
4. **Check spam folder**: Emails might be filtered

### Resend Errors

- Verify API key is correct
- Check Resend dashboard for rate limits
- Ensure `EMAIL_FROM` domain is verified in Resend

### SMTP Errors

- Verify SMTP credentials
- Check firewall/network settings
- Ensure port is not blocked
- For Gmail: Use app-specific password, not regular password

## Production Checklist

- [ ] Set up Resend account or SMTP provider
- [ ] Add `RESEND_API_KEY` or SMTP credentials to `.env`
- [ ] Set `EMAIL_FROM` with verified domain
- [ ] Set `ADMIN_EMAIL` to admin's email
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production URL
- [ ] Test email sending in production
- [ ] Monitor email delivery rates
- [ ] Set up email analytics (if using Resend)

## Email Content Customization

Edit email templates in `/lib/email.ts`:

- `sendAdminReportNotification()` - Admin notification template
- `sendSellerNotification()` - Seller product report notification
- `sendStrikeNotification()` - Strike notification template

Customize HTML, subject lines, and content as needed.

