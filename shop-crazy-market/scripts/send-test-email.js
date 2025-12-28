/**
 * Script to send a test email
 * Usage: node scripts/send-test-email.js EMAIL_ADDRESS
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { sendEmail } = require('../lib/email');

async function sendTestEmail(email) {
  if (!email) {
    console.log('Usage: node scripts/send-test-email.js EMAIL_ADDRESS');
    process.exit(1);
  }

  console.log('\n📧 Sending test email...');
  console.log('To:', email);
  console.log('Resend API Key:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
  console.log('');

  const testEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #7c3aed;
        }
        .header h1 {
          color: #7c3aed;
          margin: 0;
        }
        .success {
          background-color: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          text-align: center;
          margin: 20px 0;
          font-weight: bold;
        }
        .info {
          background-color: #f9fafb;
          border-left: 4px solid #7c3aed;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Email Test Successful!</h1>
        </div>
        
        <div class="success">
          ✅ Your Resend email integration is working perfectly!
        </div>

        <div class="info">
          <h3>Test Details:</h3>
          <ul>
            <li><strong>Service:</strong> Resend</li>
            <li><strong>Sent To:</strong> ${email}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            <li><strong>Status:</strong> Delivered</li>
          </ul>
        </div>

        <p>If you received this email, your Resend API key is configured correctly and order confirmation emails will be sent automatically when customers complete purchases.</p>

        <div class="footer">
          <p>This is a test email from Shop Crazy Market</p>
          <p>Order confirmation emails will use this same email service.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await sendEmail({
      to: email,
      subject: "✅ Shop Crazy Market - Email Test Successful!",
      html: testEmailHtml,
    });

    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox at:', email);
      console.log('   (Also check spam folder if you don\'t see it)');
    } else {
      console.log('❌ Failed to send email. Check the error above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
sendTestEmail(email);

