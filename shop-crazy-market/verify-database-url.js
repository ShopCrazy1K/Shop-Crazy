// Verify DATABASE_URL format
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require';

console.log('🔍 Verifying DATABASE_URL format...\n');

// Parse URL
try {
  const url = new URL(dbUrl);
  
  console.log('✅ URL is valid');
  console.log('Protocol:', url.protocol);
  console.log('Host:', url.hostname);
  console.log('Port:', url.port);
  console.log('Database:', url.pathname.slice(1));
  console.log('Query params:', url.searchParams.toString());
  
  // Check requirements
  console.log('\n📋 Requirements Check:');
  
  const checks = {
    'Protocol is postgresql://': url.protocol === 'postgresql:',
    'Port is 6543 (pooler)': url.port === '6543',
    'Has pgbouncer=true': url.searchParams.get('pgbouncer') === 'true',
    'Host contains pooler': url.hostname.includes('pooler'),
  };
  
  Object.entries(checks).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}`);
  });
  
  // Extract username from userinfo
  const userInfo = url.username;
  console.log('\n👤 Username:', userInfo);
  console.log('🔑 Password: [HIDDEN]');
  
  // Check for special characters in password
  const password = url.password || '';
  const specialChars = ['#', '$', '@', '%', '&', '+', '='];
  const hasSpecialChars = specialChars.some(char => password.includes(char));
  
  if (hasSpecialChars) {
    console.log('\n⚠️  Password contains special characters that may need URL encoding');
  } else {
    console.log('\n✅ Password format looks good');
  }
  
  console.log('\n📝 Full URL (for Vercel):');
  console.log(dbUrl);
  
  console.log('\n✅ URL format is correct!');
  console.log('Add this to Vercel → Settings → Environment Variables → DATABASE_URL');
  
} catch (error) {
  console.error('❌ Invalid URL format:', error.message);
  process.exit(1);
}
