/**
 * Direct test of Resend API
 * Usage: node scripts/test-resend-direct.js EMAIL_ADDRESS RESEND_API_KEY
 */

const { Resend } = require('resend');

async function testResend(email, apiKey) {
  if (!email || !apiKey) {
    console.log('Usage: node scripts/test-resend-direct.js EMAIL_ADDRESS RESEND_API_KEY');
    console.log('Or set RESEND_API_KEY in environment:');
    console.log('  RESEND_API_KEY=your_key node scripts/test-resend-direct.js EMAIL_ADDRESS');
    process.exit(1);
  }

  console.log('\n📧 Testing Resend API directly...');
  console.log('Email:', email);
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('');

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Shop Crazy Market <noreply@shopcrazymarket.com>',
      to: [email],
      subject: '✅ Shop Crazy Market - Direct Resend Test',
      html: `
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Direct Resend Test</h1>
            </div>
            
            <div class="success">
              ✅ This email was sent directly via Resend API!
            </div>

            <p>If you received this email, your Resend API key is working correctly.</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Recipient:</strong> ${email}</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    if (data) {
      console.log('✅ Email sent successfully!');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('📬 Check your inbox at:', email);
      console.log('   (Also check spam folder if you don\'t see it)');
      console.log('');
      console.log('💡 If you don\'t receive the email:');
      console.log('   1. Check spam/junk folder');
      console.log('   2. Verify your Resend API key is correct');
      console.log('   3. Check Resend dashboard for delivery status');
      console.log('   4. Make sure your domain is verified in Resend (if using custom domain)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
const apiKey = process.argv[3] || process.env.RESEND_API_KEY;

testResend(email, apiKey);

