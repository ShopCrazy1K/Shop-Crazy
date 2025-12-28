# 📧 Email Setup for Vercel

## ✅ EMAIL_FROM Added Locally

I've added `EMAIL_FROM` to your local `.env` file. Now you need to add it to Vercel.

## 🔧 Add to Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your **Shop Crazy Market** project
3. Click **Settings** → **Environment Variables**

### Step 2: Add EMAIL_FROM
Click **"Add New"** and enter:
- **Name:** `EMAIL_FROM`
- **Value:** `Shop Crazy Market <noreply@shopcrazymarket.com>`
- **Environment:** Select all (Production, Preview, Development)
- Click **"Save"**

## 📬 Choose an Email Service

You need to set up one email service. Choose one:

### Option 1: Resend (Recommended - Easiest)

**Benefits:**
- ✅ Easy setup
- ✅ Free tier: 3,000 emails/month
- ✅ Good deliverability
- ✅ Built-in analytics

**Setup:**
1. Sign up at https://resend.com (free)
2. Get your API key from dashboard
3. Add to Vercel:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key (starts with `re_...`)
   - **Environment:** All environments
4. Verify your domain (optional but recommended)

### Option 2: SMTP (Gmail, SendGrid, etc.)

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Add to Vercel:
   - **Name:** `SMTP_HOST` → **Value:** `smtp.gmail.com`
   - **Name:** `SMTP_PORT` → **Value:** `587`
   - **Name:** `SMTP_SECURE` → **Value:** `false`
   - **Name:** `SMTP_USER` → **Value:** `your-email@gmail.com`
   - **Name:** `SMTP_PASS` → **Value:** `your-app-password`

**For SendGrid:**
1. Sign up at https://sendgrid.com
2. Create an API key
3. Add to Vercel:
   - **Name:** `SMTP_HOST` → **Value:** `smtp.sendgrid.net`
   - **Name:** `SMTP_PORT` → **Value:** `587`
   - **Name:** `SMTP_SECURE` → **Value:** `false`
   - **Name:** `SMTP_USER` → **Value:** `apikey`
   - **Name:** `SMTP_PASS` → **Value:** `your-sendgrid-api-key`

## ✅ Quick Setup Checklist

- [ ] Add `EMAIL_FROM` to Vercel
- [ ] Choose email service (Resend or SMTP)
- [ ] Add email service credentials to Vercel
- [ ] Redeploy your application
- [ ] Test by making a purchase

## 🧪 Test Email

After setup, make a test purchase and check:
1. Customer receives order confirmation email
2. Check email service dashboard for sent emails
3. Check spam folder if email doesn't arrive

## 📝 Current Configuration

**EMAIL_FROM:** `Shop Crazy Market <noreply@shopcrazymarket.com>`

This is the "from" address that will appear in all order confirmation emails.

## 🚀 After Setup

Once you've added the environment variables to Vercel:
1. **Redeploy** your application (or wait for next deployment)
2. Emails will automatically send when customers complete orders
3. Check Vercel function logs for email sending status

## 💡 Recommendation

I recommend **Resend** because:
- Free tier is generous (3,000 emails/month)
- Very easy to set up
- Great for production use
- No complex SMTP configuration needed

Just sign up, get your API key, and add `RESEND_API_KEY` to Vercel!

