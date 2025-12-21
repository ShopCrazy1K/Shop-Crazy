// Fix DATABASE_URL encoding and write to .env.local for Prisma
const fs = require('fs');
const path = require('path');

if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  
  // Check if password contains unencoded #
  const urlPattern = /^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/;
  const match = url.match(urlPattern);
  
  if (match) {
    const [, prefix, password, suffix] = match;
    
    // If password has # but not %23, encode it
    if (password.includes('#') && !password.includes('%23')) {
      const encodedPassword = password.replace(/#/g, '%23');
      url = `${prefix}${encodedPassword}${suffix}`;
      
      // Write to .env.local so Prisma can read it
      const envPath = path.join(process.cwd(), '.env.local');
      fs.writeFileSync(envPath, `DATABASE_URL="${url}"\n`, 'utf8');
      
      console.log('✅ Fixed DATABASE_URL encoding (encoded # as %23)');
      console.log('   Written to .env.local');
    } else {
      console.log('✅ DATABASE_URL encoding is correct');
    }
  }
} else {
  console.log('⚠️  DATABASE_URL not set');
  process.exit(1);
}

